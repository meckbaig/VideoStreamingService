using System.ComponentModel.DataAnnotations;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public class RegistrationVM
    {
        [Display(Name = "Имя пользователя")]
        [Required(ErrorMessage = "Обязательно для заполнения")]
        public string Name { get; set; }

        [Display(Name = "Электронная почта")]
        [Required(ErrorMessage = "Обязательно для заполнения")]
        public string Email { get; set; }

        [Display(Name = "Пароль")]
        [Required(ErrorMessage = "Обязательно для заполнения")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        [Display(Name = "Подтверждение пароля")]
        [Required(ErrorMessage = "Обязательно для заполнения")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Пароль не совпадает")]
        public string ConfirmPassword { get; set; }


    }
}
