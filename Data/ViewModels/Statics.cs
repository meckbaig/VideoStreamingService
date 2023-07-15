using System.ComponentModel.DataAnnotations;
using System.Reflection;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public static class Statics
    {
        public static readonly string chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
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
    }
}
