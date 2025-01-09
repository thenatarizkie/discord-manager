import 'dotenv/config';
import { Client } from 'discord.js-selfbot-v13';
import process from 'process';
import prompts from 'prompts';
import delay from 'delay';
import ora from 'ora';
import fetch from 'node-fetch';
import schedule from 'node-schedule';

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

const toGetSearchMessages = async (guildId = '', userId = '', tokenId = '', content = '') => {
    const searchUrl = `https://discord.com/api/v9/guilds/${guildId}/messages/search?author_id=${userId}&content=${encodeURIComponent(content)}`;

    try {
        const request = await fetch(searchUrl, {
            headers: {
                accept: '*/*',
                'accept-language': 'en-US,en;q=0.9',
                authorization: tokenId,
                'cache-control': 'no-cache',
                pragma: 'no-cache',
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-discord-locale': 'en-US',
                'x-discord-timezone': 'Asia/Jakarta',
            },
            method: 'GET',
        });

        if (request.status == 200 || request.status == 201 || request.status == 204) {
            let listData = [];
            const response = await request.json();

            response.messages.forEach((messageGroup) => {
                messageGroup.forEach((message) => {
                    listData.push({
                        messageId: message.id,
                        channelId: message.channel_id,
                        content: message.content,
                        author: message.author.username,
                        timestamp: message.timestamp,
                    });
                });
            });

            return {
                status: 'success',
                data: listData,
                message: 'Successfully get the search message',
            };
        } else {
            return {
                status: 'failed',
                data: [],
                message: `Failed to get the search message`,
            };
        }
    } catch (error) {
        return {
            status: 'failed',
            data: [],
            message: `There was an error when searching for messages: ${error.message}`,
        };
    }
};

async function bot() {
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

    const { mangoAddressId } = await prompts(
        {
            type: 'text',
            name: 'mangoAddressId',
            message: 'Enter mango address',
            validate: (value) => (value.trim() === '' ? 'Mango address is required' : true),
        },
        { onCancel },
    );

    let pausedFor = 0;
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
        pausedFor = manualDelay;
    }

    client.on('ready', async () => {
        console.log(' ');
        console.log('=======================================================');
        console.log(' ');

        console.log(`You have successfully logged in using your ${client.user.globalName} account!`);

        const channel = client.channels.cache.get(channelId);

        if (!channel || !channel.isText()) {
            console.log('Invalid channel or the channel is not a text channel');
            process.exit(1);
        }

        console.log('Accounts are ready to take action');
        console.log(' ');
        console.log('=======================================================');
        console.log(' ');

        schedule.scheduleJob('0 22 * * *', async () => {
            let hasMessagesToDelete = true;

            while (hasMessagesToDelete) {
                const getSearchMessage = await toGetSearchMessages(
                    channel.guildId,
                    client.user.id,
                    tokenId,
                    mangoAddressId,
                );
                const listSearchMessage = getSearchMessage.data || [];

                if (listSearchMessage.length === 0) {
                    console.log('There are no messages that need to be deleted');
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');
                    hasMessagesToDelete = false;
                    continue;
                }

                if (listSearchMessage.length > 0) {
                    for (const value of listSearchMessage) {
                        try {
                            const channelFromSearch = client.channels.cache.get(value.channelId);

                            if (!channelFromSearch || !channelFromSearch.isText()) {
                                console.log('Invalid channel or the channel is not a text channel');
                                console.log(' ');
                                console.log('=======================================================');
                                console.log(' ');
                                continue;
                            }

                            const messageFromSearch = await channelFromSearch.messages.fetch(value.messageId);
                            if (!messageFromSearch) {
                                console.log(`Message with ID ${value.messageId} cannot be found`);
                                console.log(' ');
                                console.log('=======================================================');
                                console.log(' ');
                                continue;
                            }

                            await messageFromSearch.delete();
                            console.log(`Message with ID ${value.messageId} successfully deleted`);
                            console.log(' ');
                            console.log('=======================================================');
                            console.log(' ');
                        } catch (error) {
                            console.error(`Failed to delete message with ID ${value.messageId}:`, error.message);
                            console.log(' ');
                            console.log('=======================================================');
                            console.log(' ');
                        }
                    }
                }
            }
        });

        let number = 1;
        while (true) {
            try {
                const message = `<@1322128247550640130> ${mangoAddressId}`;
                await channel.send(message);
                console.log(`Number of Process: ${number}`);
                console.log(`Message Sent: ${message}`);

                const timePaused = formatTime(pausedFor);

                console.log(`Auto faucet will be delayed for ${timePaused}`);
                console.log(` `);
                console.log(`=======================================================`);
                console.log(` `);

                let timeLeft = pausedFor / 1000;
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

                await delay(pausedFor);
                spinner.stop();

                number++;
            } catch (error) {
                console.error('There is an error when requesting a faucet:', error);
                process.exit(1);
            }
        }
    });

    client.login(tokenId);
}

bot();
