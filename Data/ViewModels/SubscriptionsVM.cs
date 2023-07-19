using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public class SubscriptionsVM
    {
        public List<UserChannel> Channels { get; set; } = new List<UserChannel>();

        public SubscriptionsVM()
        {

        }

        public SubscriptionsVM(List<User> users, User curUser)
        {
            foreach (var user in users)
            {
                Channels.Add(new UserChannel(user, curUser));
			}
        }
    }
}
