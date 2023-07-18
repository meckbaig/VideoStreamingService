using System.Reflection;
using VideoStreamingService.Data.ViewModels;

namespace VideoStreamingService.Models
{
	public class FormattedVideo : Video
	{
		public new string Length { get; set; }
        public long ViewsCount { get; set; }
        public new string Resolution { get; set; }
		public bool AllowEdit { get; set; }
		public string UploadDate { get; set; }
        public bool? Like { get; set; }

		public FormattedVideo(Video video, User curUser = null)
		{
			foreach (var prop in video.GetType().GetProperties())
			{
				try
				{ 
					if (prop.Name!=nameof(Length) 
						&& prop.Name != nameof(FormattedVideo.Resolution)
						&& prop.Name != "Item")
                    this[prop.Name] = video[prop.Name]; 
				}
				catch (TargetParameterCountException) 
				{
				}
			}

			Length = TimeSpan.FromSeconds(video.Length).ToString("g");
			if (TimeSpan.FromSeconds(video.Length).Hours == 0)
			{
				Length = Length.Remove(0, 2);
				if (Length.StartsWith("0"))
					Length = Length.Remove(0, 1);
			}
			if (Length == "0" && (Visibility == VideoVisibilityEnum.Visible || Visibility == VideoVisibilityEnum.LinkAccess))
                Length = "В обработке";
			ViewsCount = 0;
			foreach (var view in video.Views)
			{
				ViewsCount += view.Watched;
			}
			AllowEdit = false;

			UploadDate = video.Uploaded.ToString("D");


			if (curUser != null)
			{
				Like = video.Reactions.FirstOrDefault(r => r.UserId == curUser.Id)?.Like;
				if (video.Views.FirstOrDefault
					(v => v.UserId == curUser.Id) != null)
					Length += " Просмотрено";
				if (curUser.Role == RoleEnum.Developer)
					AllowEdit = true;
				else
					AllowEdit = video.UserId == curUser.Id;
			}
			Resolution = $"{video.Resolution}p";
		}

		public string LongViewsString()
		{
			if (ViewsCount > 1000)
				return Statics.LongDescription(ViewsCount, "просмотр");
			return "";
		}
		public string LongSubsString()
		{
			long subs = User.Subscribers.Count;
			if (subs > 1000)
				return Statics.LongDescription(subs, "подписчик");
			return "";
		}

		public string ViewsString()
        {
			if (ViewsCount > 1000)
				return Statics.LongToShortString(ViewsCount) + " просмотров";
			return Statics.LongDescription(ViewsCount, "просмотр");
        }

        public string SubsString()
		{
			long subs = User.Subscribers.Count;
			if (subs > 1000)
				return Statics.LongToShortString(subs) + " подписчиков";
			return Statics.LongDescription(subs, "подписчик");
        }
    }
}
