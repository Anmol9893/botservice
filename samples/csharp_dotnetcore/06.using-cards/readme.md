﻿This sample demonstrates the use of rich content using cards.
# Concepts introduced in this sample
## What is a bot?
A bot is an app that users interact with in a conversational way using text, graphics (cards), or speech. It may be a simple question and answer dialog,
or a sophisticated bot that allows people to interact with services in an intelligent manner using pattern matching,
state tracking and artificial intelligence techniques well-integrated with existing business services.
## Rich Cards
Most channels support rich content.  In this sample we explore the different types of rich cards your bot may use.
## To try this sample
- Clone the repository.
```bash
git clone https://github.com/microsoft/botbuilder-samples.git
```
- [Optional] Update the `appsettings.json` file under `botbuilder-samples\samples\csharp_dotnetcore\06.using-card` with your botFileSecret.  For Azure Bot Service bots, you can find the botFileSecret under application settings.
# Prerequisites
## Visual Studio
- Navigate to the samples folder (`BotBuilder-Samples\samples\csharp_dotnetcore\06.using-cards`) and open CardsBot.csproj in Visual Studio 
- Hit F5
## Visual Studio Code
- Open `BotBuilder-Samples\samples\csharp_dotnetcore\06.using-cards` folder
- Bring up a terminal, navigate to BotBuilder-Samples\samples\csharp_dotnetcore\06.Using-Cards
- Type 'dotnet run'.
## Update packages
- In Visual Studio right click on the solution and select "Restore NuGet Packages".
  **Note:** this sample requires `Microsoft.Bot.Builder`, `Microsoft.Bot.Builder.Dialogs`, and `Microsoft.Bot.Builder.Integration.AspNet.Core`.
# Further reading
- [Azure Bot Service Introduction](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Bot basics](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [Channels and Bot Connector service](https://docs.microsoft.com/en-us/azure/bot-service/bot-concepts?view=azure-bot-service-4.0)
- [Activity processing](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-activity-processing?view=azure-bot-service-4.0)
- [Rich cards](https://docs.microsoft.com/en-us/azure/bot-service/dotnet/bot-builder-dotnet-add-rich-card-attachments?view=azure-bot-service-4.0)
