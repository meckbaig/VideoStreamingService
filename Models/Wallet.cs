using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using VideoStreamingService.Data;

namespace VideoStreamingService.Models;

public class Wallet : BasicClass
{
    [Key]
    public int UserId { get; set; }
    [Display(Name = "Номер кошелька Юмани")]
    [RegularExpression(@"^[0-9]{5,20}$",
        ErrorMessage = "Используйте только числа")]
    [Remote(action: "CheckYoomoneyId", controller: "Payment", 
        ErrorMessage ="Кошелёк не существует")]
    public string? YoomoneyId { get; set; }
    [Display(Name = "Номер телефона кошелька Qiwi")]
    [RegularExpression(@"^[0-9]{11}$",
        ErrorMessage = "Некорректный номер телефона")]
    [Phone(ErrorMessage = "Некорректный номер телефона")]
    public string? QiwiPhoneNumber { get; set; }
    
    public User? User { get; set; }

    public Wallet() { }
    public Wallet(int userId)
    {
        UserId = userId;
    }
}