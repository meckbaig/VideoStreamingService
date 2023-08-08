using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _context;

    public PaymentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Wallet> GetWallet(int userId)
    {
        return _context.Wallets.FirstOrDefault(w => w.UserId == userId) ?? new Wallet(userId);
    }
    
    public async Task<Wallet> GetWallet(string userUrl)
    {
        return await GetWallet(_context.Users
            .Select(u => new { u.Id, u.Url })
            .FirstOrDefault(u => u.Url == userUrl)!.Id);
    }

    public async Task<bool> SetWallet(Wallet newWallet, int userId)
    {
        if (newWallet.UserId != userId)
            return false;
        Wallet wallet = _context.Wallets.FirstOrDefault(w => w.UserId == userId);
        if (string.IsNullOrEmpty(newWallet.QiwiPhoneNumber ?? "") && string.IsNullOrEmpty(newWallet.YoomoneyId ?? ""))
        {
            if (wallet != null)
                _context.Wallets.Remove(wallet);
        }
        else
        {
            if (newWallet?.QiwiPhoneNumber?.StartsWith("8") ?? false)
                newWallet.QiwiPhoneNumber = "7" + newWallet.QiwiPhoneNumber.Remove(0, 1);
            if (wallet != null)
            {
                foreach (var prop in wallet.GetType().GetProperties())
                {
                    if (prop.Name != "Item")
                        wallet[prop.Name] = newWallet[prop.Name];
                }
            }
            else
                _context.Wallets.Add(newWallet);
        }
        await _context.SaveChangesAsync();
        return true;
    }
}