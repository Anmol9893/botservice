﻿This sample shows how to route messages to dialogs.
# Concepts introduced in this sample
In this sample, we create a bot that collects user information after the user greets the bot.  The bot can also provide help. 
# To try this sample
- Clone the samples repository
```bash
git clone https://github.com/Microsoft/botbuilder-samples.git
```
## Install BotBuilder tools
- In a command prompt, navigate to the samples folder (`BotBuilder-Samples\csharp_dotnetcore\09.Message-Routing`) 
    ```bash
    cd BotBuilder-Samples\csharp_dotnetcore\09.Message-Routing
    ```
## Visual Studio
- Navigate to the samples folder (`BotBuilder-Samples\csharp_dotnetcore\9.Message-Routing`) and open MessageRoutingBot.csproj in Visual Studio 
- Hit F5
## Visual Studio Code
- Open `BotBuilder-Samples\csharp_dotnetcore\9.Message-Routing` sample folder.
- Bring up a terminal, navigate to BotBuilder-Samples\9.Message-Routing folder
- type 'dotnet run'
## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.
- Install the Bot Framework Emulator from [here](https://aka.ms/botframeworkemulator).
### Connect to bot using Bot Framework Emulator
- Launch Bot Framework Emulator
- File -> Open bot and navigate to `BotBuilder-Samples\csharp_dotnetcore\09.Message-Routing` folder
- Select BotConfiguration.bot file
# Further reading
- [Azure Bot Service Introduction](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
