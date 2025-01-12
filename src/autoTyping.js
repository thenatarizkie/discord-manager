/**
 * @license Discord Manager
 * autoTyping.js
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
import delay from 'delay';
import ora from 'ora';

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

    client.on('ready', async () => {
        console.log(' ');
        console.log('=======================================================');
        console.log(' ');

        console.log(`Copyright (c) 2025 - Present Natarizkie`);
        console.log(`Web: https://natarizkie.com/ - E-mail: natarizkie@gmail.com`);
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

        let number = 1;
        let pausedFor = 9000;
        while (true) {
            try {
                console.log(`Current Time: ${new Date().toString()}`);
                console.log(`Number of Process: ${number}`);

                const timePaused = formatTime(pausedFor);

                await channel.sendTyping();

                console.log(`The action was delayed for ${timePaused}`);
                console.log(' ');
                console.log('=======================================================');
                console.log(' ');

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
                console.log('There was an error when typing:', error);
                process.exit(1);
            }
        }
    });

    client.login(tokenId);
}

bot();
