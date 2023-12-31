﻿using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Reflection;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
	public class UserChannel : User, ISearchElement
    {
        public bool Subed { get; set; } = false;
        public bool Ignored { get; set; } = false;
		public bool OwnChanel { get; set; } = false;
        public float? SorensenDiceCoefficient { get; set; }
        public long? MaxResults { get => Subscribers.Count; }
        public FeedVM FeedVM { get; set; } = new FeedVM() { FeedType = Statics.FeedTypeEnum.Channel };
		public UserChannel(User user, int? curUserId, List<Video> videos = null)
		{
			foreach (var prop in user.GetType().GetProperties())
			{
				try
				{
					if(prop.Name != nameof(Videos) && prop.Name != "Item")
						this[prop.Name] = user[prop.Name];
				}
				catch (TargetParameterCountException) { }
			}
			if (user.Id == curUserId)
				OwnChanel = true;
			else if (curUserId != null)
			{
				bool? Sub_Ignore = user.Subscribers?.FirstOrDefault(s => s.FromUserId == curUserId)?.Sub_Ignore;
				if (Sub_Ignore != null)
				{
					Subed = (bool)Sub_Ignore;
					Ignored = (bool)!Sub_Ignore;
				}
			}
            else
                Ignored = true;

			// if (videos != null)
			// 	FeedVM.Videos = videos.ToFormattedVideos(curUser);
		}

		public UserChannel()
		{

		}

		public string LongSubsString()
		{
			long subs = Subscribers?.Count ?? 0;
			if (subs > 1000)
				return Statics.LongDescription(subs, "подписчик");
			return "";
		}

		public string SubsString()
		{
			long subs = Subscribers.Count;
			if (subs > 1000)
				return Statics.LongToShortString(subs) + " подписчиков";
			return Statics.LongDescription(subs, "подписчик");
		}
	}
}
