using System.ComponentModel.DataAnnotations;
using System.Reflection;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public static class Statics
    {
        public enum TokenType
        {
            Upload,
            Stream
        }

        public enum FeedTypeEnum
        {
            HomePage,
            Channel,
            History,
			Library,
            Search,
			Recommendations
		}

        private static List<CtById> uploadTokens = new List<CtById>();
        public static List<CtById> UploadTokens // id - мыло и ссылка на видео
        {
            get => uploadTokens;
            set => uploadTokens = value;
        }
        private static List<CtById> streamTokens = new List<CtById>();
        public static List<CtById> StreamTokens // id - ссылка на видео
        {
            get => streamTokens;
            set => streamTokens = value;
        }

        public static CancellationTokenSource AddToken(string id, TokenType tt, int cancelAfterSec = 0)
        {
            CancellationTokenSource cts = new CancellationTokenSource();
            if (cancelAfterSec > 0)
                cts.CancelAfter(TimeSpan.FromSeconds(cancelAfterSec));
            switch (tt)
            {
                case TokenType.Upload: UploadTokens.Add(new CtById(id, cts)); break;
                case TokenType.Stream: StreamTokens.Add(new CtById(id, cts)); break;
            }
            return cts;
        }

        public static CancellationTokenSource GetToken(string id, TokenType tt)
        {
            CancellationTokenSource cts = null;
            try
            {
                switch (tt)
                {
                    case TokenType.Upload: cts = UploadTokens?.FirstOrDefault(cbi => cbi.Id == id)?.Cts; break;
                    case TokenType.Stream: cts = StreamTokens?.FirstOrDefault(cbi => cbi.Id == id)?.Cts; break;
                }
            }
            catch (Exception)
            {
                return cts;
            }
            return cts;
        }

        public static void RemoveToken(string id, TokenType tt)
        {
            switch (tt)
            {
                case TokenType.Upload: UploadTokens.Remove(UploadTokens.FirstOrDefault(cbi => cbi.Id == id)); break;
                case TokenType.Stream: StreamTokens.Remove(UploadTokens.FirstOrDefault(cbi => cbi.Id == id)); break;
            }
        }

        public static List<T> Shuffle<T>(List<T> list)
        {
            Random rand = new Random();

            for (int i = list.Count - 1; i >= 1; i--)
            {
                int j = rand.Next(i + 1);

                T temporal = list[j];
                list[j] = list[i];
                list[i] = temporal;
            }
            return list;
        }

        public static string GetEnumDisplayName(this Enum enumValue)
        {
            return enumValue.GetType().GetMember(enumValue.ToString())
                           .First()
                           .GetCustomAttribute<DisplayAttribute>()
                           .Name;
        }

        public static string LongDescription(long number, string description)
        {
			switch (number % 10)
			{
				case 1: 
                    return $"{number} {description}";
				case (2 or 3 or 4): 
                    return $"{number} {description}а";
				default: 
                    return $"{number} {description}ов"; 
			}
		}

        public static string LongToShortString(long number)
        {
			int mag = (int)(Math.Floor(Math.Log10(number)) / 3); 
			double divisor = Math.Pow(10, mag * 3);

			double shortNumber = number / divisor;

			string suffix;
			switch (mag)
			{
				case 1:
					suffix = " тыс.";
					break;
				case 2:
					suffix = " млн.";
					break;
				case 3:
					suffix = " млрд.";
					break;
				default:
					suffix = string.Empty;
					break;
			}
			return shortNumber.ToString("N1") + suffix; 
		}
        
        public static float SorensenDiceCoefficient(string strA, string strB)
        {
            HashSet<string> setA = new HashSet<string>();
            HashSet<string> setB = new HashSet<string>();

            for (int i = 0; i < strA.Length - 1; ++i)
                setA.Add(strA.Substring(i, 2).ToLower().Normalize());

            for (int i = 0; i < strB.Length - 1; ++i)
                setB.Add(strB.Substring(i, 2).ToLower().Normalize());

            HashSet<string> intersection = new HashSet<string>(setA);
            intersection.IntersectWith(setB);

            return (float)(2.0 * intersection.Count) / (setA.Count + setB.Count);
        }

        public static List<FormattedVideo> ToFormattedVideos(this List<Video> videos, User curUser)
        {
            List<FormattedVideo> fv = new List<FormattedVideo>();
            foreach (var v in videos)
            {
                fv.Add(new FormattedVideo(v, curUser));
            }
            return fv;
        }
    }
}
