
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { CVData } from "@/types/cv";

interface PersonalInfoProps {
  register: UseFormRegister<CVData>;
}

export function PersonalInfoSection({ register }: PersonalInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Personal Information</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input {...register("fullName")} id="fullName" placeholder="John Doe" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input {...register("email")} id="email" type="email" placeholder="john@example.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input {...register("phone")} id="phone" placeholder="+1 234 567 890" />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input {...register("linkedin")} id="linkedin" placeholder="linkedin.com/in/johndoe" />
        </div>
      </div>
    </div>
  );
}
