using System.Reflection;

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
					if (prop.Name!=nameof(Length) && prop.Name != nameof(FormattedVideo.Resolution))
                    this[prop.Name] = video[prop.Name]; 
				}
				catch (TargetParameterCountException) { }
			}

			Length = TimeSpan.FromSeconds(video.Length).ToString("g");
			if (TimeSpan.FromSeconds(video.Length).Hours == 0)
			{
				Length = Length.Remove(0, 2);
				if (Length.StartsWith("0"))
					Length = Length.Remove(0, 1);
			}
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
	}
}
