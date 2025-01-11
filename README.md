# Discord Manager

This powerful and highly customizable Discord bot is designed to enhance your performance and streamline your tasks while working on airdrops. Whether you're managing daily activities or automating repetitive tasks, this bot has got you covered. With six robust features, it’s the perfect assistant to help you stay focused and efficient.

## Key Features

Boost productivity and simplify tasks with these 6 powerful automation tools for your Discord server.

- **Auto Chat**: Automate chat responses and keep the conversation going without lifting a finger. This feature ensures your bot is always engaged, responding intelligently and instantly
- **Forbidden Words**: Protect your community by automatically filtering out forbidden words. This feature helps maintain a respectful environment by blocking inappropriate language
- **Gm Gn**: Never miss out on sending greetings again! The bot will automatically send "Good Morning" or "Good Night" messages to your server, keeping things friendly and lively
- **Reaction**: Add fun and engagement with automated reactions. This feature lets the bot react to messages with emojis, making interactions more dynamic and entertaining
- **Typing**: Simulate typing activity for a more natural and human-like presence. This feature adds an extra touch of realism to your bot's behavior
- **Faucet Mango Network**: Perfect for those working on airdrops, this feature automates the faucet claim process on Mango, helping you stay ahead of the game without having to manually claim rewards

## Prerequisites

### 1. Node.js

To run this bot, you need Node.js. You can download and install it from the official Node.js website.

- **Download**: [Node.js Official Website](https://nodejs.org/en)
- **Version**: The bot requires Node.js version 16 or higher
- **Verify**: Once you have Node.js installed, open your terminal or command prompt and check the version using the following commands:

    ```bash
    node -v
    npm -v
    ```

### 2. Discord Token

A discord token is required to connect your account with [discord.js-selfbot-v13](https://www.npmjs.com/package/discord.js-selfbot-v13). To get your discord tokens, follow these steps:

- **Log in to Discord**: Make sure you're already logged in to your Discord account on your web browser
- **Open Developer Tools**:

    - On your browser, press **Ctrl + Shift + I** (Windows/Linux) or **Cmd + Option + I** (Mac) to open Developer Tools
    - Navigate to the Console tab

- **Run the Code Below**: Copy and paste the following JavaScript code into the console, then press Enter:

    ```javascript
    // prettier-ignore
    (webpackChunkdiscord_app.push([[''], {}, (e) => {
        m = [];
        for (let c in e.c) m.push(e.c[c]);
    }]), m).find((m) => m?.exports?.default?.getToken !== void 0).exports.default.getToken();
    ```

- **Get Your Token**: After running the code, your token will appear in the console. Copy it and keep it safe. Important:

    - Never share your token with anyone
    - Treat it like a password to protect your account from unauthorized access

### 3. Discord Channel ID

- **Open Discord Web**: Use the web version of Discord to simplify the process

    - Go to [Discord Web](https://discord.com/)
    - Log in to your account if you haven’t already

- **Navigate to the Desired Server and Channel**: Find the channel whose ID you want to retrieve

    - Open the server containing the channel
    - Click on the channel name in the server’s sidebar to open it

- **Copy the Channel ID from the URL**: Extract the Channel ID directly from the URL

    - Look at your browser's address bar
    - The URL should look something like this

    ```javascript
    // prettier-ignore
    https://discord.com/channels/<server_id>/<channel_id>
    ```

    - The <channel_id> is the last part of the URL

### 4. Gemini API Key

## Installation

## Usage

## Configuration

## Testing

The project includes basic tests for each feature using Mocha and Chai. To run tests, use the following command:

```bash
npm run test
```

## How to Contribute

Please check our [CONTRIBUTING.md](CONTRIBUTING.md) guide for more details.

## Suppport & Donation

If you found this bot helpful, consider supporting the project:

- **Solana**: `5p9sz5oHJnYHt65KgjKHLWGa8KzbgYeeKKk9wwi5LC6j`
- **Polkadot**: `15kMFT3QUoPZkso8Zcqk5VaAociA8kYGe8YD8zZNUhnz1VUa`
- **EVM**: `0xA276D7a3128Ec6408162031B5088780eD2957da9`
- **BTC**: `bc1px28ff63grh0zun9t7rf2jkf939yg6fyrt6zelxplqe2ujzt5l05qma64l3`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Feel free to use and modify it for your own purposes.
