using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Reflection;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
	public class ChannelVM : User
    {
        public bool Subed { get; set; } = false;
        public bool Ignored { get; set; } = false;
		public bool OwnChanel { get; set; } = false;
        //new public List<FormattedVideo> Videos { get; set; } = new List<FormattedVideo>();
		public ChannelVM(User user, User curUser = null)
		{
			foreach (var prop in user.GetType().GetProperties())
			{
				try
				{
					if(prop.Name != nameof(Videos))
						this[prop.Name] = user[prop.Name];
				}
				catch (TargetParameterCountException) { }
			}
			//foreach (Video video in user.Videos)
			//{
			//	if (user.Id == curUser?.Id || (video.VisibilityId == (int)VideoVisibilityEnum.Visible))
			//	{
			//		Videos.Add(new FormattedVideo(video, curUser));
			//	}
			//}
			if (user.Id == curUser?.Id)
				OwnChanel = true;
			else if (curUser != null)
			{
				bool? Sub_Ignore = user.Subscribers?.FirstOrDefault(s => s.FromUserId == curUser.Id)?.Sub_Ignore;
				if (Sub_Ignore != null)
				{
					Subed = (bool)Sub_Ignore;
					Ignored = (bool)!Sub_Ignore;
				}
			}
            else
                Ignored = true;
        }

		public ChannelVM()
		{

		}
	}
}
