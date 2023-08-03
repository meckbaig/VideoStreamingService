using System.ComponentModel.DataAnnotations;
using Xabe.FFmpeg;

namespace VideoStreamingService.Data.ViewModels;

public class AppConfigVM : BasicClass
{
    [Display(Name = "Символы в автогенерируемом url")]
    public string UrlChars { get; set; }
    [Display(Name = "Количество видео на странице")]
    public int VideosOnPage { get; set; }
    [Display(Name = "Количество загружаемых страниц видео")]
    public int MaxVideoPages { get; set; }
    [Display(Name = "Стандартная иконка профиля")]
    public string DefaultProfilePicture { get; set; }
    [Display(Name = "Длина автогенерируемого url")]
    public int DefaultUrlLength { get; set; }
    [Display(Name = "Страниц в запросе")]
    public int PagesInChunk { get; set; }
    [Display(Name = "Использовать GPU")]
    public bool UseGpu { get; set; }
    [Display(Name = "Кодек видео")]
    public VideoCodec VideoCodec { get; set; }
}