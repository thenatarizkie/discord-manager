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

    const { mangoAddressId } = await prompts(
        {
            type: 'text',
            name: 'mangoAddressId',
            message: 'Enter mango address',
            validate: (value) => (value.trim() === '' ? 'Mango address is required' : true),
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
            process.exit(1);
        }

        console.log('Accounts are ready to take action');
        console.log(' ');
        console.log('=======================================================');
        console.log(' ');

        let number = 1;
        let pausedFor = 10000;
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
