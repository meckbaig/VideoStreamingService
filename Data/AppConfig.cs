using System.Text.Json;
using Xabe.FFmpeg;

namespace VideoStreamingService.Data
{
    public interface IAppConfig : IBasicClass
    {
        string UrlChars { get; }
        int VideosOnPage { get; }
        int MaxVideoPages { get; }
        string DefaultProfilePicture { get; }
        int DefaultUrlLength { get; }
        int PagesInChunk { get; }
        bool UseGpu { get; }
        VideoCodec VideoCodec { get; }
        void UpdateAppSetting(string key, string value);
        void UpdateAppSettings(List<string> keys, List<string> values);
    }

    public class AppConfig : BasicClass, IAppConfig
    {
        readonly IConfiguration _config;

        public AppConfig(IConfiguration configuration)
        {
            _config = configuration;
        }

        public VideoCodec VideoCodec => (VideoCodec)Enum.Parse(typeof(VideoCodec), _config["AppConfig:" + nameof(VideoCodec)]);
        public string UrlChars => _config["AppConfig:" + nameof(UrlChars)];
        public int VideosOnPage => Convert.ToInt32(_config["AppConfig:" + nameof(VideosOnPage)]);
        public int MaxVideoPages => Convert.ToInt32(_config["AppConfig:" + nameof(MaxVideoPages)]);
        public string DefaultProfilePicture => _config["AppConfig:" + nameof(DefaultProfilePicture)];
        public int DefaultUrlLength => Convert.ToInt32(_config["AppConfig:" + nameof(DefaultUrlLength)]);
        public int PagesInChunk => Convert.ToInt32(_config["AppConfig:" + nameof(PagesInChunk)]);
        public bool UseGpu => _config["AppConfig:" + nameof(UseGpu)].ToLower() == "true" ? true : false;

        public void UpdateAppSetting(string key, string value)
        {
            var configJson = File.ReadAllText("appsettings.json");
            var config = JsonSerializer.Deserialize<Dictionary<string, object>>(configJson);
            var appConfig = JsonSerializer.Deserialize<Dictionary<string, object>>(config["AppConfig"].ToString());
            appConfig[key] = value;
            config["AppConfig"] = appConfig;
            var updatedConfigJson = JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText("appsettings.json", updatedConfigJson);
        }
        
        public void UpdateAppSettings(List<string> keys, List<string> values)
        {
            var configJson = File.ReadAllText("appsettings.json");
            var config = JsonSerializer.Deserialize<Dictionary<string, object>>(configJson);
            var appConfig = JsonSerializer.Deserialize<Dictionary<string, object>>(config["AppConfig"].ToString());
            for (int i = 0; i < keys.Count; i++)
            {
                appConfig[keys[i]] = values[i];
            }
            config["AppConfig"] = appConfig;
            var updatedConfigJson = JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText("appsettings.json", updatedConfigJson);
        }
    }
}