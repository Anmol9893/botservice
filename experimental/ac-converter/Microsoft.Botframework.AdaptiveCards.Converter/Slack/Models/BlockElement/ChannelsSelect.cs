﻿using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;

namespace Microsoft.Botframework.AdaptiveCards.Converter.Slack.Models
{
    public class ChannelsSelect : IBlockElement
    {
        public string type { get; } = "channels_select";
        public TextObject placeholder { get; set; }
        public string action_id { get; set; }
        public string initial_channel { get; set; }
        public ConfirmObject confirm { get; set; }
        public bool response_url_enabled { get; set; }
        public JObject properties { get; set; }
    }
}
