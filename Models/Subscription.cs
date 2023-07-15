using System.ComponentModel.DataAnnotations.Schema;

namespace VideoStreamingService.Models
{
    public class Subscription
    {
        public int FromUserId { get; set; }
        [ForeignKey("FromUserId")]
        public User FromUser { get; set; }

        public int ToUserId { get; set; }
        [ForeignKey("ToUserId")]
        public User ToUser { get; set; }

        public bool Sub_Ignore { get; set; }
    }
}
