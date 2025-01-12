/**
 * @license Discord Manager
 * autoForbiddenWords.js
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
import fs from 'fs';
import BadWordsNext from 'bad-words-next';

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

const warningsFilePath = './assets/listUserWarning.json';
const badWordsFilePath = './assets/listBadWord.json';

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

const saveWarnings = (warnings) => {
    const data = JSON.stringify(Object.fromEntries(warnings), null, 2);
    fs.writeFileSync(warningsFilePath, data);
};

async function bot() {
    let userWarnings = loadFileJson(warningsFilePath, 'map');
    // prettier-ignore
    let userAllowed = ['natarizkie'];
    let gifWarning = [
        'https://tenor.com/view/travis-fran-healy-you-said-a-bad-word-bad-word-swearing-gif-27378431',
        'https://tenor.com/view/andy-dunlop-travis-do-not-use-that-word-bad-words-bad-word-gif-18253273661304946283',
        'https://tenor.com/view/mlp-mlp-g5-mlp-a-new-generation-my-little-pony-bad-word-gif-26042557',
        'https://tenor.com/view/ok-no-more-forbidden-words-forbidden-words-slurs-ifunny-caption-scam1992-gif-21242345',
    ];
    let gifTimeout = [
        'https://tenor.com/view/timeout-gif-24036567',
        'https://tenor.com/view/sm-mrs-fitzpatrick-time-out-that-is-it-timeout-mister-youre-going-in-a-timeout-gif-6130045413312493042',
        'https://tenor.com/view/stranger-things-hellfire-club-the-hellfire-club-grant-goodman-stranger-things-season4-gif-25917902',
    ];
    let gifBanned = [
        'https://tenor.com/view/bane-no-banned-and-you-are-explode-gif-16047504',
        'https://tenor.com/view/spongebob-ban-pubg-lite-banned-rainbow-gif-16212382',
    ];

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

        console.log('Welcome to Discord Manager!');
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
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot || message.channel.id != channelId || userAllowed.includes(message.author.tag)) return;

        let countWord = message.content.trim().split(/\s+/).filter(Boolean).length;

        const badWordsData = loadFileJson(badWordsFilePath, 'array');
        const badwords = new BadWordsNext({ data: badWordsData });

        const detected = badwords.check(message.content);

        let detectedBadWords = [];

        badwords.filter(message.content, (badWord) => {
            detectedBadWords.push(badWord);
        });

        if (detected) {
            await message.delete();

            const userId = message.author.id;
            let warnings = userWarnings.get(userId) || 0;
            warnings += 1;
            userWarnings.set(userId, warnings);
            saveWarnings(userWarnings);

            const randomWarning = gifWarning[Math.floor(Math.random() * gifWarning.length)];
            const randomTimeout = gifTimeout[Math.floor(Math.random() * gifTimeout.length)];
            const randomBanned = gifBanned[Math.floor(Math.random() * gifBanned.length)];

            console.log(`Current Time: ${new Date().toString()}`);
            console.log(`Message: ${message.content}`);
            console.log(`Word sent by ${message.author.globalName}: ${countWord} words`);

            if (warnings !== 3 && warnings !== 7 && warnings !== 10 && warnings !== 15) {
                await message.channel.send(
                    `${message.author} using the word ||**${detectedBadWords.join(', ')}**|| is inappropriate and prohibited here, ${warnings}x warning.`,
                );
                await message.channel.send(randomWarning);

                console.log(
                    `${message.author.globalName} using the word ${detectedBadWords.join(', ')} is inappropriate and prohibited here, ${warnings}x warning.`,
                );
            }

            if (warnings === 3) {
                if (message.member.moderatable) {
                    const timeoutDuration = 5 * 60 * 1000;
                    await message.member.timeout(timeoutDuration, 'Have received 3 warnings');
                    await message.channel.send(
                        `${message.author} has been given a timeout of 5 minute because it has received 3x warnings.`,
                    );
                    await message.channel.send(randomTimeout);

                    console.log(
                        `${message.author.globalName} has been given a timeout of 5 minute because it has received 3x warnings.`,
                    );
                }
            } else if (warnings === 7) {
                if (message.member.moderatable) {
                    const timeoutDuration = 15 * 60 * 1000;
                    await message.member.timeout(timeoutDuration, 'Have received 7 warnings');
                    await message.channel.send(
                        `${message.author} has been given a timeout of 15 minute because it has received 7x warnings.`,
                    );
                    await message.channel.send(randomTimeout);

                    console.log(
                        `${message.author.globalName} has been given a timeout of 15 minute because it has received 7x warnings.`,
                    );
                }
            } else if (warnings === 10) {
                if (message.member.moderatable) {
                    const timeoutDuration = 30 * 60 * 1000;
                    await message.member.timeout(timeoutDuration, 'Have received 10 warnings');
                    await message.channel.send(
                        `${message.author} has been given a timeout of 30 minute because it has received 10x warnings.`,
                    );
                    await message.channel.send(randomTimeout);

                    console.log(
                        `${message.author.globalName} has been given a timeout of 30 minute because it has received 10x warnings.`,
                    );
                }
            } else if (warnings === 15) {
                if (message.member.moderatable) {
                    await message.member.kick('Have received 15 warnings');
                    await message.channel.send(`${message.author} has been kicked after receiving 15x warnings.`);
                    await message.channel.send(randomBanned);

                    console.log(`${message.author.globalName} has been kicked after receiving 15x warnings.`);

                    userWarnings.delete(userId);
                    saveWarnings(userWarnings);
                }
            }

            console.log(' ');
            console.log('=======================================================');
            console.log(' ');
        }
    });

    client.login(tokenId);
}

bot();
