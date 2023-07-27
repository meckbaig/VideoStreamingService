using System.Reflection;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public class FormattedVideo : Video, ISearchElement
    {
        public string LengthString { get; set; }
        public long ViewsCount { get; set; }
        public long? MaxResults { get => ViewsCount; }
        public string ResolutionString { get; set; }
        public bool AllowEdit { get; set; } = false;
        public string UploadDateString { get; set; }
        public DateTime ViewDate { get; set; }
        public string ViewDateString { get; set; }
        public float? SorensenDiceCoefficient { get; set; }

        public bool? Like { get; set; }

        //public FormattedVideo()
        //{
        //    ResolutionString = $"{Resolution}p";
        //    AddLength();
        //    AddViewsCount();
        //    UploadDateString = Uploaded.ToString("D");
        //}

        public FormattedVideo(Video video, User? curUser = null)
        {
            ParseVideoProps(video);
            ResolutionString = $"{video.Resolution}p";
            AddLength();
            AddViewsCount();
            UploadDateString = video.Uploaded.ToString("D");


            if (curUser != null)
                AddUserRelatedInformation(curUser);
        }


        public void AddUserRelatedInformation(User curUser)
        {
            Like = Reactions.FirstOrDefault(r => r.UserId == curUser.Id)?.Like;
            View view = Views.FirstOrDefault(v => v.UserId == curUser.Id);
            if (view != null)
            {
                LengthString += " Просмотрено";
                ViewDate = view.Date;
                ViewDateString = ViewDate.ToString("D");
            }
            if (curUser.Role == RoleEnum.Developer)
                AllowEdit = true;
            else
                AllowEdit = UserId == curUser.Id;
        }

        private void ParseVideoProps(Video video)
        {
            foreach (var prop in video.GetType().GetProperties())
            {
                try
                {
                    if (prop.Name != "Item")
                        this[prop.Name] = video[prop.Name];
                }
                catch (TargetParameterCountException)
                {
                }
            }
        }

        private void AddLength()
        {
            LengthString = TimeSpan.FromSeconds(Length).ToString("g");
            if (TimeSpan.FromSeconds(Length).Hours == 0)
            {
                LengthString = LengthString.Remove(0, 2);
                if (LengthString.StartsWith("0"))
                    LengthString = LengthString.Remove(0, 1);
            }
            if (ResolutionString == "0p" && (Visibility == VideoVisibilityEnum.Visible || Visibility == VideoVisibilityEnum.LinkAccess))
                LengthString = "В обработке";
        }

        private void AddViewsCount()
        {
            ViewsCount = 0;
            foreach (var view in Views)
            {
                ViewsCount += view.Watched;
            }
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

        public string DescriptionSubstring()
        {
            int len = Description.Length > 200 ? 200 : Description.Length;
            return Description.Substring(0, len);
        }
    }
}
