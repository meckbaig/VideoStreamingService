using System.ComponentModel.DataAnnotations;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public class LoginVM
    {
        [Display(Name = "Электронная почта")]
        [Required(ErrorMessage = "Обязательно для заполнения")]
        public string Email { get; set; }

        [Display(Name = "Пароль")]
        [Required(ErrorMessage = "Обязательно для заполнения")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
