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

- **Get Your Token**: After running the code, your token will appear in the console. Copy and save safely for later use in your bot configuration. Important:

    - Never share your token with anyone
    - Treat it like a password to protect your account from unauthorized access

### 3. Discord Channel ID

Channel ID are required for the bot to send messages to specific channels on the Discord server. To get your Discord channel ID, follow these steps:

- **Open Discord Web**: Use the web version of Discord to simplify the process

    - Go to [Discord Web](https://discord.com/)
    - Log in to your account if you haven’t already

- **Navigate to the Desired Server and Channel**: Find the channel whose ID you want to retrieve

    - Open the server containing the channel
    - Click on the channel name in the server’s sidebar to open it

- **Copy the Channel ID from the URL**: Extract the Channel ID directly from the URL

    - Look at your browser's address bar
    - The URL should look something like this

        ```text
        https://discord.com/channels/<server_id>/<channel_id>
        ```

    - The <channel_id> is the last part of the URL

- **Save the Channel ID**: Copy and save for later use in your bot configuration

### 4. Gemini API Key

Gemini API keys are used to generate messages when interacting with other users. To get your Gemini API key, follow these steps:

- **Visit the Google AI Studio Website**: Open your browser and go to [Google AI Studio](https://aistudio.google.com/)
- **Log In to Your Google Account**: Access your account to proceed

    - Click Sign in to Google AI Studio
    - Use your Google credentials to log in

- **Navigate to the API Key Section**: Find the option to generate your API key

    - After logging in, look for and click the Get API Key button
    - Click the Create API Key button

- **Copy and Save the API Key**: Once the key is generated, copy it to a safe location for later use in your bot configuration

## Installation

- **Clone the Repository**: Get a copy of the project code on your local machine

    ```bash
    git clone https://github.com/thenatarizkie/discord-manager.git
    cd discord-manager
    ```

- **Install Dependencies**: Install all required packages and dependencies

    ```bash
    npm install
    ```

- **Create a .env File**: Set up your environment variables by creating a .env file

    ```bash
    cp .env.example .env
    ```

- **Add Your Gemini API Key**: Paste your Gemini API key into the .env file

    - Open the .env file in a text editor
    - Replace the placeholder with your actual Gemini API key

        ```env
        GEMINI_API_KEY="your_actual_api_key"
        ```

## Usage

Each script corresponds to a different automation feature. Each script will require a valid `Discord Token` and `Discord Channel ID` and possibly other additional configuration. You can run any script individually using `npm run`:

### 1. Auto Chat

The bot reads messages sent by other users on a particular channel and utilises the Gemini API to generate matching reply messages. The bot will send an auto-reply message according to the one generated by the Gemini API.

- **Usage**:

    ```bash
    npm run discordAutoChat
    ```

- **Prompts**:

    - **Discord Token**: Authentication token to log in the bot
    - **Discord Channel**: ID of the channel where messages will be sent
    - **List Auto Chat**: Options for the type of auto chat:

        - **Talk With AI**: The bot uses AI to respond to messages

            - **List Model AI**: AI models available for use (refer to [listModelAI.json](assets/listModelAI.json))
            - **List Language**: Language options for responses (refer to [listLanguage.json](assets/listLanguage.json))
            - **List Type**: Method of sending responses, either to the channel or as a reply
            - **Delay Message**: Time delay before sending a message

        - **Quote**: The bot sends motivational quotes

            - **List Language**: Language options for quotes (refer to [listLanguage.json](assets/listLanguage.json))
            - **Delay Message**: Time delay before sending a quote
            - **Delay Delete**: Time delay before deleting the quote

### 2. Auto Forbidden Words

The bot scans all messages sent by other users on a particular channel and checks for the presence of words on the banned list. If found, the bot will delete the message and alert the user (timeout/kick).

- **Usage**:

    ```bash
    npm run discordAutoForbiddenWords
    ```

- **Prompts**:

    - **Discord Token**: Authentication token to log in the bot
    - **Discord Channel**: ID of the channel to be monitored

### 3. Auto Gm Gn

The bot will check the time and send a "Good Morning" message in the morning (08:00 UTC) or "Good Night" message in the evening (22:00 UTC) according to the preset schedule.

- **Usage**:

    ```bash
    npm run discordAutoGmGn
    ```

- **Prompts**:

    - **Discord Token**: Authentication token to log in the bot
    - **Discord Channel**: ID of the channel where the messages will be sent
    - **List Custom Message**: Options for GM/GN messages:

        - **Default Messages**: Use pre-defined messages
        - **Custom Messages**: Use user-defined custom messages

            - **Custom GM Text**: Custom "Good Morning" text
            - **Custom GN Text**: Custom "Good Night" text

### 4. Auto Reaction

The bot will scan messages sent by other users on a particular channel and add random emoji reactions.

- **Usage**:

    ```bash
    npm run discordAutoReaction
    ```

- **Prompts**:

    - **Discord Token**: Authentication token to log in the bot
    - **Discord Channel**: ID of the channel to be monitored
    - **List Random**: Options for reaction behavior:

        - **All Messages Without Delay**: React to all messages immediately
        - **All Messages With Delay**: React to all messages with a delay

            - **List Delay**:

                - **Manual Delay**: Set reaction delay manually

                    - **Delay Reaction**: Time delay for the reaction

                - **Automatic Delay**: Delay determined automatically by the bot

        - **Random Messages**: React only to certain messages randomly

### 5. Auto Typing

The bot will trigger the "typing" animation (Typing Indicator) at certain preset time intervals, making it appear as if the bot is active.

- **Usage**:

    ```bash
    npm run discordAutoTyping
    ```

- **Prompts**:

    - **Discord Token**: Authentication token to log in the bot
    - **Discord Channel**: ID of the channel where typing simulation occurs

### 6. Auto Faucet Mango

The bot will send Mango faucet claim requests according to the preset time interval in the specified channel.

- **Usage**:

    ```bash
    npm run discordAutoFaucetMango
    ```

- **Prompts**:

    - **Discord Token**: Authentication token to log in the bot
    - **Discord Channel**: ID of the channel where claims are made
    - **Mango Address**: Mango address to receive the claimed rewards
    - **Delay Message**: Time delay before each claim is made

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
