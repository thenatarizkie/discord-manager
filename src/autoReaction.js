/**
 * @license Discord Manager
 * autoReaction.js
 *
 * Copyright (c) 2025 - Present Natarizkie
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import 'dotenv/config';
import { Client } from 'discord.js-selfbot-v13';
import process from 'process';
import prompts from 'prompts';
import ora from 'ora';
import delay from 'delay';

const client = new Client({ checkUpdate: false });

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

const arrListRandom = [
    {
        id: 'All Without Delay',
        name: 'All Messages Without Delay',
    },
    {
        id: 'All With Delay',
        name: 'All Messages With Delay',
    },
    {
        id: 'Random',
        name: 'Random Messages',
    },
];

const arrListDelay = [
    {
        id: 'Manual',
        name: 'Manual Delay',
    },
    {
        id: 'Automatic',
        name: 'Automatic Delay',
    },
];

async function bot() {
    let chooseListRandomName = '';
    let chooseListRandomId = '';
    let arrListRandomPrompts = [];

    let chooseListDelayName = '';
    let chooseListDelayId = '';
    let arrListDelayPrompts = [];

    arrListRandom.forEach((row) => {
        arrListRandomPrompts.push({
            title: row.name,
            value: row.id,
        });
    });

    arrListDelay.forEach((row) => {
        arrListDelayPrompts.push({
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

    const { getListRandom } = await prompts(
        {
            type: 'select',
            name: 'getListRandom',
            message: 'Choose whether to give a random reaction',
            choices: arrListRandomPrompts,
        },
        { onCancel },
    );

    const getListRandomExists = arrListRandom.some((prompt) => prompt.id === getListRandom);

    if (getListRandomExists) {
        const listRandom = arrListRandom.find((prompt) => prompt.id === getListRandom);
        chooseListRandomName = listRandom.name;
        chooseListRandomId = listRandom.id;

        if (chooseListRandomId === 'All With Delay') {
            const { getListDelay } = await prompts(
                {
                    type: 'select',
                    name: 'getListDelay',
                    message: 'Choose whether the delay is randomised',
                    choices: arrListDelayPrompts,
                },
                { onCancel },
            );

            const getListDelayExists = arrListDelay.some((prompt) => prompt.id === getListDelay);

            if (getListDelayExists) {
                const listDelay = arrListDelay.find((prompt) => prompt.id === getListDelay);
                chooseListDelayName = listDelay.name;
                chooseListDelayId = listDelay.id;

                let randomDelay = 0;

                if (chooseListDelayId === 'Manual') {
                    const response = await prompts(
                        {
                            type: 'text',
                            name: 'manualDelay',
                            message: 'Enter how many delay (1000 = 1 seconds)',
                            validate: (value) => {
                                const trimmedValue = value.trim();
                                if (trimmedValue === '') {
                                    return 'How many delay is required';
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

                    const manualDelay = parseInt(response.manualDelay);
                    if (!isNaN(manualDelay)) {
                        randomDelay = manualDelay;
                    }
                }

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
                });

                let number = 1;
                const messageQueue = [];
                let isProcessing = false;
                client.on('messageCreate', async (message) => {
                    if (message.author.bot || message.channel.id != channelId || message.author.tag == client.user.tag)
                        return;

                    const containsLink = /(https?:\/\/[^\s]+)/g.test(message.content);

                    if (message.attachments.size > 0 || message.content.trim() === '' || containsLink) {
                        console.log(
                            `Message from ${message.author.globalName} ignored because it is a link or non-text`,
                        );
                        console.log(' ');
                        console.log('=======================================================');
                        console.log(' ');
                        return;
                    }

                    messageQueue.push(message);

                    if (!isProcessing) {
                        processQueue();
                    }
                });

                async function processQueue() {
                    if (messageQueue.length === 0) {
                        isProcessing = false;
                        return;
                    }

                    isProcessing = true;
                    const message = messageQueue.shift();

                    try {
                        const guild = message.guild;
                        const emojiList = guild.emojis.cache;
                        const freeEmojis = emojiList.filter((emoji) => emoji.requiresColons && !emoji.animated);
                        const freeEmojiList = freeEmojis.map((emoji) => emoji.toString());
                        const defaultEmoji = ['✅', '😅', '🔥', '❤️', '💯', '💛', '👍', '🤝', '😊', '🤩', '❤️‍🔥'];
                        const arrEmoji = freeEmojiList.length > 0 ? [...freeEmojiList, ...defaultEmoji] : defaultEmoji;

                        const randomEmojiValue = arrEmoji[Math.floor(Math.random() * arrEmoji.length)];

                        if (chooseListDelayId == 'Automatic') {
                            randomDelay = Math.floor(Math.random() * 7000) + 1000;
                        }

                        console.log(`Current Time: ${new Date().toString()}`);
                        console.log(`Number of Process: ${number}`);
                        console.log(`Randomised Selection: ${chooseListRandomName} (${chooseListDelayName})`);
                        console.log(`Message: ${message.content} (${message.author.globalName})`);

                        await message
                            .react(randomEmojiValue)
                            .then(() => {
                                console.log(
                                    `Adding a reaction ${randomEmojiValue} to ${message.author.globalName} message`,
                                );
                            })
                            .catch((error) => {
                                console.log(`Failed to react to message: ${error.message}`);
                            });

                        const timePaused = formatTime(randomDelay);

                        console.log(`The action was delayed for ${timePaused}`);
                        console.log(' ');
                        console.log('=======================================================');
                        console.log(' ');

                        let timeLeft = randomDelay / 1000;
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

                        await delay(randomDelay);
                        spinner.stop();
                    } catch (error) {
                        console.log(`Error processing message: ${error.message}`);
                        console.log(' ');
                        console.log('=======================================================');
                        console.log(' ');
                    }

                    number++;
                    processQueue();
                }

                client.login(tokenId);
            } else {
                console.log(' ');
                console.log('=======================================================');
                console.log(' ');
                console.log('Delay choice not found');
                console.log(' ');
                console.log('=======================================================');
                console.log(' ');
                process.exit(1);
            }
        } else {
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
            });

            let number = 1;
            const messageQueue = [];
            let isProcessing = false;
            client.on('messageCreate', async (message) => {
                if (message.author.bot || message.channel.id != channelId || message.author.tag == client.user.tag)
                    return;

                const containsLink = /(https?:\/\/[^\s]+)/g.test(message.content);

                if (chooseListRandomId === 'Random') {
                    if (Math.random() > 0.4) {
                        console.log(`Ignoring messages from ${message.author.globalName}`);
                        console.log(' ');
                        console.log('=======================================================');
                        console.log(' ');
                        return;
                    }
                }

                if (message.attachments.size > 0 || message.content.trim() === '' || containsLink) {
                    console.log(`Message from ${message.author.globalName} ignored because it is a link or non-text`);
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');
                    return;
                }

                messageQueue.push(message);

                if (!isProcessing) {
                    processQueue();
                }
            });

            async function processQueue() {
                if (messageQueue.length === 0) {
                    isProcessing = false;
                    return;
                }

                isProcessing = true;
                const message = messageQueue.shift();

                try {
                    const guild = message.guild;
                    const emojiList = guild.emojis.cache;
                    const freeEmojis = emojiList.filter((emoji) => emoji.requiresColons && !emoji.animated);
                    const freeEmojiList = freeEmojis.map((emoji) => emoji.toString());
                    const defaultEmoji = ['✅', '😅', '🔥', '❤️', '💯', '💛', '👍', '🤝', '😊', '🤩', '❤️‍🔥'];
                    const arrEmoji = freeEmojiList.length > 0 ? [...freeEmojiList, ...defaultEmoji] : defaultEmoji;

                    const randomEmojiValue = arrEmoji[Math.floor(Math.random() * arrEmoji.length)];

                    console.log(`Current Time: ${new Date().toString()}`);
                    console.log(`Number of Process: ${number}`);
                    console.log(`Randomised Selection: ${chooseListRandomName}`);
                    console.log(`Message: ${message.content} (${message.author.globalName})`);

                    await message
                        .react(randomEmojiValue)
                        .then(() => {
                            console.log(
                                `Adding a reaction ${randomEmojiValue} to ${message.author.globalName} message`,
                            );
                        })
                        .catch((error) => {
                            console.log(`Failed to react to message: ${error.message}`);
                        });
                } catch (error) {
                    console.log(`Error processing message: ${error.message}`);
                }

                console.log(' ');
                console.log('=======================================================');
                console.log(' ');

                number++;
                processQueue();
            }

            client.login(tokenId);
        }
    } else {
        console.log(' ');
        console.log('=======================================================');
        console.log(' ');
        console.log('Random choice not found');
        console.log(' ');
        console.log('=======================================================');
        console.log(' ');
        process.exit(1);
    }
}

bot();
