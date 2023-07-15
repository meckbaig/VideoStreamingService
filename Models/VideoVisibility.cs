namespace VideoStreamingService.Models
{
    public class VideoVisibility
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public VideoVisibility() { }
        public VideoVisibility(VideoVisibilityEnum @enum)
        {
            Id = (int)@enum;
            Name = @enum.ToString();
        }
        public static implicit operator VideoVisibility(VideoVisibilityEnum @enum) => new VideoVisibility(@enum);
        public static implicit operator VideoVisibilityEnum(VideoVisibility v) => (VideoVisibilityEnum)v.Id;
    }
}
