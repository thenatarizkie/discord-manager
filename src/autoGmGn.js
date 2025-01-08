import 'dotenv/config';
import { Client } from 'discord.js-selfbot-v13';
import process from 'process';
import prompts from 'prompts';
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

const arrListCustom = [
    {
        id: 'Default',
        name: 'Default Messages',
    },
    {
        id: 'Custom',
        name: 'Custom Messages',
    },
];

async function bot() {
    let chooseListCustomName = '';
    let chooseListCustomId = '';
    let arrListCustomPrompts = [];

    arrListCustom.forEach((row) => {
        arrListCustomPrompts.push({
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

    const { getListCustom } = await prompts(
        {
            type: 'select',
            name: 'getListCustom',
            message: 'Choose whether to use custom messages',
            choices: arrListCustomPrompts,
        },
        { onCancel },
    );

    const getListCustomExists = arrListCustom.some((prompt) => prompt.id === getListCustom);

    if (getListCustomExists) {
        const listCustom = arrListCustom.find((prompt) => prompt.id === getListCustom);
        chooseListCustomName = listCustom.name;
        chooseListCustomId = listCustom.id;

        let gmText = 'gm';
        let gnText = 'gn';

        if (chooseListCustomId === 'Custom') {
            const responseGm = await prompts(
                {
                    type: 'text',
                    name: 'manualGm',
                    message: 'Enter the message for 08:00 UTC (gm)',
                    validate: (value) => (value.trim() === '' ? 'Message is required' : true),
                },
                { onCancel },
            );

            const responseGn = await prompts(
                {
                    type: 'text',
                    name: 'manualGn',
                    message: 'Enter the message for 20:00 UTC (gn)',
                    validate: (value) => (value.trim() === '' ? 'Message is required' : true),
                },
                { onCancel },
            );

            gmText = responseGm.manualGm;
            gnText = responseGn.manualGn;
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

            schedule.scheduleJob('0 8 * * *', async () => {
                try {
                    await channel.send(gmText);
                    console.log(`Type Custom: ${chooseListCustomName}`);
                    console.log(`Current timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
                    console.log(`Current time: ${new Date().toString()}`);
                    console.log(`Send a gm message:: "${gmText}"`);
                    console.log('Messages scheduled successfully!');
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');
                } catch (error) {
                    console.log(`Type Custom: ${chooseListCustomName}`);
                    console.log(`Current timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
                    console.log(`Current time: ${new Date().toString()}`);
                    console.error('There was an error sending a gm message:', error);
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');
                }
            });

            schedule.scheduleJob('0 22 * * *', async () => {
                try {
                    await channel.send(gnText);
                    console.log(`Type Custom: ${chooseListCustomName}`);
                    console.log(`Current timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
                    console.log(`Current time: ${new Date().toString()}`);
                    console.log(`Send a gn message:: "${gnText}"`);
                    console.log('Messages scheduled successfully!');
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');
                } catch (error) {
                    console.log(`Type Custom: ${chooseListCustomName}`);
                    console.log(`Current timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
                    console.log(`Current time: ${new Date().toString()}`);
                    console.error('There was an error sending a gn message:', error);
                    console.log(' ');
                    console.log('=======================================================');
                    console.log(' ');
                }
            });
        });

        client.login(tokenId);
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
