namespace VideoStreamingService.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public Role() { }
        public Role(RoleEnum @enum)
        {
            Id = (int)@enum;
            Name = @enum.ToString();
        }
        public static implicit operator Role(RoleEnum @enum) => new Role(@enum);
        public static implicit operator RoleEnum(Role role) => (RoleEnum)role.Id;
    }
}
