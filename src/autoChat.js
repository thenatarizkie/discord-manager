import 'dotenv/config';
import { Client } from 'discord.js-selfbot-v13';
import { GoogleGenerativeAI } from '@google/generative-ai';
import process from 'process';
import prompts from 'prompts';
import delay from 'delay';
import LanguageDetect from 'languagedetect';
import fs from 'fs';
import translate from 'translate-google';
import ora from 'ora';

const client = new Client({ checkUpdate: false });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const lngDetector = new LanguageDetect();

let lastMessage = null;
let isProcessing = false;
let isSpinner = false;
let messageQueue = [];

const onCancel = () => {
    console.log(' ');
    console.log('=======================================================');
    console.log(' ');
    console.log('Ongoing process has been canceled');
    console.log(' ');
    console.log('=======================================================');
    console.log(' ');
    process.exit(1);
};

const formatTime = (ms) => {
    let minutes = Math.floor(ms / (1000 * 60));
    let seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${minutes} minutes ${seconds} seconds`;
};

const modelAiFilePath = './assets/listModelAI.json';
const languageFilePath = './assets/listLanguage.json';
const quotesEnFilePath = './assets/listQuotesEn.json';

const loadFileJson = (path = '', type = 'array') => {
    if (type === 'array') {
        if (fs.existsSync(path)) {
            const rawData = fs.readFileSync(path, 'utf-8');
            const jsonData = JSON.parse(rawData);
            return jsonData || [];
        }
        return [];
    } else if (type === 'map') {
        if (fs.existsSync(path)) {
            const rawData = fs.readFileSync(path, 'utf-8');
            const mapData = JSON.parse(rawData);
            return new Map(Object.entries(mapData));
        }
        return new Map();
    }
};

const processQueue = async (
    message = {},
    listModel = [],
    mode = 'Talk With AI',
    modelAiId = 'casualWithoutEmoji',
    modelAiName = 'Casual without Emoji',
    language = 'Auto',
    typeId = 'Send Channel',
    typeName = 'Send Channel',
    timeDelay = 1000,
    isQueue = false,
) => {
    isProcessing = true;

    try {
        const cleanedContent = message.content.replace(/<@\d+>/g, '').trim();
        const detectedLanguages = lngDetector.detect(cleanedContent, 20);

        let detectedLanguage = 'English';

        if (language === 'Auto') {
            // Cek disini
            for (let i = 0; i < detectedLanguages.length; i++) {
                const language = detectedLanguages[i][0];
                if (language === 'indonesian') {
                    detectedLanguage = 'Indonesian';
                    break;
                } else if (language === 'english') {
                    detectedLanguage = 'English';
                    break;
                }
            }
        } else {
            detectedLanguage = language;
        }

        console.log(`Current Time: ${new Date().toString()}`);
        console.log(`Mode: ${mode} (${modelAiName})`);
        console.log(`Translate to ${language}`);
        console.log(`Type: ${typeName}`);

        if (isQueue === true) {
            console.log(`Origial Queued Message (${message.author.tag}): ${cleanedContent} (${detectedLanguage})`);
        } else {
            console.log(`Original Message (${message.author.tag}): ${cleanedContent} (${detectedLanguage})`);
        }

        const response = await generateResponse(listModel, modelAiId, cleanedContent, detectedLanguage);

        if (response) {
            await message.channel.sendTyping();
            await delay(2000);

            if (typeId === 'Reply') {
                await message.reply(response);
            } else {
                await message.channel.send(response);
            }

            console.log(`Reply Message (${client.user.globalName}): ${response} (${detectedLanguage})`);
        }
    } catch (error) {
        console.log(`Error processing message: ${error.message}`);
    }

    const timePaused = formatTime(timeDelay);

    console.log(`The action was delayed for ${timePaused}`);
    console.log(' ');
    console.log('=======================================================');
    console.log(' ');

    let timeLeft = timeDelay / 1000;
    isSpinner = true;
    const spinner = ora('Starting countdown...').start();
    const countdownInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);

        spinner.text = `Time Left: ${minutes} minutes ${seconds} seconds`;
        timeLeft--;

        if (timeLeft < 0) {
            spinner.stop();
            clearInterval(countdownInterval);
        }
    }, 1000);

    await delay(timeDelay);
    spinner.stop();
    isProcessing = false;
    isSpinner = false;

    if (lastMessage === message) {
        lastMessage = null;
    }
};

const noResponseFromAI = (language = 'English', error = '') => {
    return error != ''
        ? language === 'English'
            ? 'Not sure what to say back'
            : 'Tidak yakin apa yang harus dikatakan kembali'
        : 'Tidak yakin apa yang harus dikatakan kembali';
};

const generateResponse = async (
    listModel = [],
    modelAiId = 'casualWithoutEmoji',
    content = '',
    language = 'English',
) => {
    try {
        const getModelAi = listModel.find((m) => m.id === modelAiId);

        const prompt = getModelAi.description.replace('{{language}}', language).replace('{{message}}', content);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt, {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 64,
            max_output_tokens: 50,
        });

        const responses = await result.response;
        let response = responses.text() || noResponseFromAI(language);
        response = response.trim();
        response = response.replace(/\n/g, ' ');

        return response;
    } catch (error) {
        return noResponseFromAI(language, error.message);
    }
};

const processQueueWithDelay = async () => {
    if (messageQueue.length > 0) {
        const nextMessage = messageQueue.shift();

        lastMessage = nextMessage.message;

        if (!isProcessing) {
            await processQueue(
                nextMessage.message,
                nextMessage.listModel,
                nextMessage.mode,
                nextMessage.modelAiId,
                nextMessage.modelAiName,
                nextMessage.language,
                nextMessage.typeId,
                nextMessage.typeName,
                nextMessage.timeDelay,
                true,
            );
        }
    }
    setTimeout(processQueueWithDelay, 5000);
};

processQueueWithDelay();

const getRandomQuote = async (listQuotes = [], translateTo = 'auto') => {
    const randomIndex = Math.floor(Math.random() * listQuotes.length);
    const textToTranslate = listQuotes[randomIndex].text;

    let translatedText = textToTranslate;
    let errorMessage = '';

    if (translateTo && translateTo.toLowerCase() !== 'en') {
        try {
            translatedText = await translate(textToTranslate, { to: translateTo });
        } catch (error) {
            errorMessage = error.message;
        }
    }

    return {
        originalMessage: textToTranslate,
        translateMessage: translatedText,
        errorMessage: errorMessage,
    };
};

const processMessageQuote = async (
    client,
    channelId = '',
    delayDelete = 1000,
    languageId = 'auto',
    languageName = 'Auto',
    mode = 'Quote',
    getRandomQuoteCallback,
) => {
    try {
        const channel = client.channels.cache.get(channelId);

        if (!channel || !channel.isText()) {
            console.log('Invalid channel or the channel is not a text channel');
            console.log(' ');
            console.log('=======================================================');
            console.log(' ');
            process.exit(1);
        }

        const response = await getRandomQuoteCallback(arrListQuotesEn, languageId);
        const sentMessage = await channel.send(response.translateMessage);

        console.log(`Current Time: ${new Date().toString()}`);
        console.log(`Mode: ${mode}`);
        console.log(`Original Message: ${response.originalMessage}`);
        console.log(`Translate to ${languageName}`);

        if (typeof response.errorMessage !== 'undefined' && response.errorMessage != '') {
            console.log(`Error Message: ${response.errorMessage}`);
        } else {
            console.log(`Translate Message: ${response.translateMessage}`);
        }

        if (delayDelete) {
            await delay(delayDelete);

            try {
                await sentMessage.delete();
                console.log('Successfully deleted the message');
            } catch (error) {
                console.log('Failed to delete message:', error.message);
            }
        }
    } catch (error) {
        console.log('Failed to process the message:', error.message);
    }
};

const arrListModelAi = loadFileJson(modelAiFilePath, 'array');
const arrListLanguage = loadFileJson(languageFilePath, 'array');
const arrListQuotesEn = loadFileJson(quotesEnFilePath, 'array');

const arrListAutoChat = [
    {
        id: 'Talk With AI',
        name: 'Talk With AI',
    },
    {
        id: 'Quote',
        name: 'Quote',
    },
];

const arrListType = [
    {
        id: 'Send Channel',
        name: 'Send Channel',
    },
    {
        id: 'Reply',
        name: 'Reply',
    },
];

async function bot() {
    let chooseListModelAiName = '';
    let chooseListModelAiId = '';
    let arrListModelAiPrompts = [];

    let chooseListLanguageName = '';
    let chooseListLanguageId = '';
    let arrListLanguagePrompts = [];

    let chooseListAutoChatName = '';
    let chooseListAutoChatId = '';
    let arrListAutoChatPrompts = [];

    let chooseListTypeName = '';
    let chooseListTypeId = '';
    let arrListTypePrompts = [];

    arrListModelAi.forEach((row) => {
        arrListModelAiPrompts.push({
            title: row.name,
            value: row.id,
        });
    });

    arrListLanguage.forEach((row) => {
        arrListLanguagePrompts.push({
            title: row.name,
            value: row.id,
        });
    });

    arrListAutoChat.forEach((row) => {
        arrListAutoChatPrompts.push({
            title: row.name,
            value: row.id,
        });
    });

    arrListType.forEach((row) => {
        arrListTypePrompts.push({
            title: row.name,
            value: row.id,
        });
    });

    const { tokenId } = await prompts(
        {
            type: 'text',
            name: 'tokenId',
            message: 'Enter discord token',
            validate: (value) => (value.trim() === '' ? 'Discord token is required' : true),
        },
        { onCancel },
    );

    const { channelId } = await prompts(
        {
            type: 'text',
            name: 'channelId',
            message: 'Enter discord channel',
            validate: (value) => (value.trim() === '' ? 'Discord channel is required' : true),
        },
        { onCancel },
    );

    const { getAutoChat } = await prompts(
        {
            type: 'select',
            name: 'getAutoChat',
            message: 'Choose the auto chat to be used',
            choices: arrListAutoChatPrompts,
        },
        { onCancel },
    );

    const getAutoChatExists = arrListAutoChat.some((prompt) => prompt.id === getAutoChat);

    if (getAutoChatExists) {
        const listAutoChat = arrListAutoChat.find((prompt) => prompt.id === getAutoChat);
        chooseListAutoChatName = listAutoChat.name;
        chooseListAutoChatId = listAutoChat.id;

        if (chooseListAutoChatId === 'Talk With AI') {
            const { getModelAi } = await prompts(
                {
                    type: 'select',
                    name: 'getModelAi',
                    message: 'Choose the model ai to be used',
                    choices: arrListModelAiPrompts,
                },
                { onCancel },
            );

            const getModelAiExists = arrListModelAi.some((prompt) => prompt.id === getModelAi);

            if (getModelAiExists) {
                const listModelAi = arrListModelAi.find((prompt) => prompt.id === getModelAi);
                chooseListModelAiName = listModelAi.name;
                chooseListModelAiId = listModelAi.id;

                const { getLanguage } = await prompts(
                    {
                        type: 'select',
                        name: 'getLanguage',
                        message: 'Choose the language to be used',
                        choices: arrListLanguagePrompts,
                    },
                    { onCancel },
                );

                const getLanguageExists = arrListLanguage.some((prompt) => prompt.id === getLanguage);

                if (getLanguageExists) {
                    const listLanguage = arrListLanguage.find((prompt) => prompt.id === getLanguage);
                    chooseListLanguageName = listLanguage.name;
                    chooseListLanguageId = listLanguage.id;

                    const { getListType } = await prompts(
                        {
                            type: 'select',
                            name: 'getListType',
                            message: 'Choose the type to be used',
                            choices: arrListTypePrompts,
                        },
                        { onCancel },
                    );

                    const getListTypeExists = arrListType.some((prompt) => prompt.id === getListType);

                    if (getListTypeExists) {
                        const listType = arrListType.find((prompt) => prompt.id === getListType);
                        chooseListTypeName = listType.name;
                        chooseListTypeId = listType.id;

                        const { delayMessage } = await prompts(
                            {
                                type: 'text',
                                name: 'delayMessage',
                                message: 'Enter how many delay message (1000 = 1 seconds)',
                                validate: (value) => {
                                    const trimmedValue = value.trim();
                                    if (trimmedValue === '') {
                                        return 'How many delay message is required';
                                    }
                                    if (isNaN(trimmedValue)) {
                                        return 'Please enter a valid number';
                                    }
                                    const intValue = parseInt(trimmedValue);
                                    if (intValue <= 0) {
                                        return 'At least more than one';
                                    }
                                    return true;
                                },
                            },
                            { onCancel },
                        );

                        client.on('ready', async () => {
                            console.log(' ');
                            console.log('=======================================================');
                            console.log(' ');

                            console.log(
                                `You have successfully logged in using your ${client.user.globalName} account!`,
                            );

                            const channel = client.channels.cache.get(channelId);

                            if (!channel || !channel.isText()) {
                                console.log('Invalid channel or the channel is not a text channel');
                                console.log(' ');
                                console.log('=======================================================');
                                console.log(' ');
                                process.exit(1);
                            }

                            console.log('Accounts are ready to take action');
                            console.log(' ');
                            console.log('=======================================================');
                            console.log(' ');
                        });

                        client.on('messageCreate', async (message) => {
                            if (
                                message.author.bot ||
                                message.channel.id != channelId ||
                                message.author.tag == client.user.tag
                            )
                                return;

                            const containsLink = /(https?:\/\/[^\s]+)/g.test(message.content);

                            if (message.attachments.size > 0 || message.content.trim() === '' || containsLink) {
                                if (isSpinner) return;
                                console.log(
                                    `Message from ${message.author.globalName} ignored because it is a link or non-text`,
                                );
                                console.log(' ');
                                console.log('=======================================================');
                                console.log(' ');
                                return;
                            }

                            const isMentioning = message.mentions.has(client.user);

                            lastMessage = message;

                            if (isMentioning) {
                                messageQueue.push({
                                    message,
                                    listModel: arrListModelAi,
                                    mode: chooseListAutoChatName,
                                    modelAiId: chooseListModelAiId,
                                    modelAiName: chooseListModelAiName,
                                    language: chooseListLanguageName,
                                    typeId: chooseListTypeId,
                                    typeName: chooseListTypeName,
                                    timeDelay: delayMessage,
                                });
                            } else {
                                if (messageQueue.length === 0) {
                                    if (!isProcessing) {
                                        await processQueue(
                                            lastMessage,
                                            arrListModelAi,
                                            chooseListAutoChatName,
                                            chooseListModelAiId,
                                            chooseListModelAiName,
                                            chooseListLanguageName,
                                            chooseListTypeId,
                                            chooseListTypeName,
                                            delayMessage,
                                            false,
                                        );
                                    }
                                }
                            }
                        });

                        client.login(tokenId);
                    } else {
                        console.log(` `);
                        console.log(`=======================================================`);
                        console.log(` `);
                        console.log(`Type choice not found`);
                        console.log(` `);
                        console.log(`=======================================================`);
                        console.log(` `);
                    }
                } else {
                    console.log(` `);
                    console.log(`=======================================================`);
                    console.log(` `);
                    console.log(`Language choice not found`);
                    console.log(` `);
                    console.log(`=======================================================`);
                    console.log(` `);
                }
            } else {
                console.log(` `);
                console.log(`=======================================================`);
                console.log(` `);
                console.log(`Model AI choice not found`);
                console.log(` `);
                console.log(`=======================================================`);
                console.log(` `);
            }
        } else {
            const { getLanguage } = await prompts(
                {
                    type: 'select',
                    name: 'getLanguage',
                    message: 'Choose the language to be used',
                    choices: arrListLanguagePrompts,
                },
                { onCancel },
            );

            const getLanguageExists = arrListLanguage.some((prompt) => prompt.id === getLanguage);

            if (getLanguageExists) {
                const listLanguage = arrListLanguage.find((prompt) => prompt.id === getLanguage);
                chooseListLanguageName = listLanguage.name;
                chooseListLanguageId = listLanguage.id;

                const { delayMessage } = await prompts(
                    {
                        type: 'text',
                        name: 'delayMessage',
                        message: 'Enter how many delay message (1000 = 1 seconds)',
                        validate: (value) => {
                            const trimmedValue = value.trim();
                            if (trimmedValue === '') {
                                return 'How many delay message is required';
                            }
                            if (isNaN(trimmedValue)) {
                                return 'Please enter a valid number';
                            }
                            const intValue = parseInt(trimmedValue);
                            if (intValue <= 0) {
                                return 'At least more than one';
                            }
                            return true;
                        },
                    },
                    { onCancel },
                );

                const { delayDelete } = await prompts(
                    {
                        type: 'text',
                        name: 'delayDelete',
                        message: 'Enter how many delay delete (1000 = 1 seconds)',
                        validate: (value) => {
                            const trimmedValue = value.trim();
                            if (trimmedValue === '') {
                                return 'How many delay delete is required';
                            }
                            if (isNaN(trimmedValue)) {
                                return 'Please enter a valid number';
                            }
                            const intValue = parseInt(trimmedValue);
                            if (intValue <= 0) {
                                return 'At least more than one';
                            }
                            return true;
                        },
                    },
                    { onCancel },
                );

                client.on('ready', async () => {
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');

                    console.log(`You have successfully logged in using your ${client.user.globalName} account!`);

                    const channel = client.channels.cache.get(channelId);

                    if (!channel || !channel.isText()) {
                        console.log('Invalid channel or the channel is not a text channel');
                        console.log(' ');
                        console.log('=======================================================');
                        console.log(' ');
                        process.exit(1);
                    }

                    console.log('Accounts are ready to take action');
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');

                    while (true) {
                        await processMessageQuote(
                            client,
                            channelId,
                            delayDelete,
                            chooseListLanguageId,
                            chooseListLanguageName,
                            chooseListAutoChatName,
                            getRandomQuote,
                        );

                        const timePausedMessage = formatTime(delayMessage);

                        console.log(`The action was delayed for ${timePausedMessage}`);
                        console.log(' ');
                        console.log('=======================================================');
                        console.log(' ');

                        let timeLeft = delayMessage / 1000;
                        const spinner = ora('Starting countdown...').start();
                        const countdownInterval = setInterval(() => {
                            const minutes = Math.floor(timeLeft / 60);
                            const seconds = Math.floor(timeLeft % 60);

                            spinner.text = `Time Left: ${minutes} minutes ${seconds} seconds`;
                            timeLeft--;

                            if (timeLeft < 0) {
                                spinner.stop();
                                clearInterval(countdownInterval);
                            }
                        }, 1000);

                        await delay(delayMessage);
                        spinner.stop();
                    }
                });

                client.login(tokenId);
            } else {
                console.log(` `);
                console.log(`=======================================================`);
                console.log(` `);
                console.log(`Language choice not found`);
                console.log(` `);
                console.log(`=======================================================`);
                console.log(` `);
            }
        }
    } else {
        console.log(` `);
        console.log(`=======================================================`);
        console.log(` `);
        console.log(`Auto chat choice not found`);
        console.log(` `);
        console.log(`=======================================================`);
        console.log(` `);
    }
}

bot();
