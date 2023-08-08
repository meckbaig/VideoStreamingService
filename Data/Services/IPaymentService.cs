using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services;

public interface IPaymentService
{
    Task<Wallet> GetWallet(int userId);
    Task<Wallet> GetWallet(string userUrl);
    Task<bool> SetWallet(Wallet newWallet, int userId);
}