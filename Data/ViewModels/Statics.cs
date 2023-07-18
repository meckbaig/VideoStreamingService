using System.ComponentModel.DataAnnotations;
using System.Reflection;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public static class Statics
    {
        public static readonly string UrlChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
        public static readonly int VideosOnPage = 20;
        public static readonly string DefaultProfilePicture = "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";
        public static readonly int DefaultUrlLength = 10;

        public enum TokenType
        {
            Upload,
            Stream
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
	}
}
