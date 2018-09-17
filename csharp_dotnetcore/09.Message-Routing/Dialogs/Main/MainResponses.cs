﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using MessageRoutingBot.Dialogs.Main.Resources;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.TemplateManager;
using Microsoft.Bot.Schema;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;

namespace MessageRoutingBot
{
    /// <summary>
    /// Responses for the <see cref="MainDialog"/>.
    /// </summary>
    public class MainResponses : TemplateManager
    {
        // Constants
        public const string Cancelled = "cancelled";
        public const string Completed = "completed";
        public const string Confused = "confused";
        public const string Greeting = "greeting";
        public const string Help = "help";
        public const string Intro = "intro";

        private static LanguageTemplateDictionary _responseTemplates = new LanguageTemplateDictionary
        {
            ["default"] = new TemplateIdMap
            {
                { Cancelled, (context, data) => MainStrings.CANCELLED },
                { Completed, (context, data) => MainStrings.COMPLETED },
                { Confused, (context, data) => MainStrings.CONFUSED },
                { Greeting, (context, data) => MainStrings.GREETING },
                { Help, (context, data) => SendHelpCard(context, data) },
                { Intro, (context, data) => SendIntroCard(context, data) },
            },
            ["en"] = new TemplateIdMap { },
            ["fr"] = new TemplateIdMap { },
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="MainResponses"/> class.
        /// </summary>
        public MainResponses()
        {
            Register(new DictionaryRenderer(_responseTemplates));
        }

        private static IMessageActivity SendIntroCard(ITurnContext turnContext, dynamic data)
        {
            var response = turnContext.Activity.CreateReply();

            var introCard = File.ReadAllText(@".\Dialogs\Main\Resources\Intro.json");

            response.Attachments = new List<Attachment>();
            response.Attachments.Add(new Attachment()
            {
                ContentType = "application/vnd.microsoft.card.adaptive",
                Content = JsonConvert.DeserializeObject(introCard),
            });

            return response;
        }

        private static IMessageActivity SendHelpCard(ITurnContext turnContext, dynamic data)
        {
            var response = turnContext.Activity.CreateReply();
            response.Attachments = new List<Attachment>();

            response.Attachments.Add(new HeroCard()
            {
                Title = MainStrings.HELP_TITLE,
                Text = MainStrings.HELP_TEXT,
                Buttons = new List<CardAction>()
                {
                    new CardAction(type: ActionTypes.OpenUrl, title: "Learn More", value: "https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0"),
                },
            }.ToAttachment());

            return response;
        }
    }
}
