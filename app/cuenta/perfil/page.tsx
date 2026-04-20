import ProfileForm from "@/components/account/ProfileForm";
import { requireSessionUser } from "@/lib/auth/service";
import { findUserById } from "@/lib/data/users";

export default async function AccountProfilePage() {
  const currentUser = await requireSessionUser("/cuenta/perfil");
  const persistedUser = await findUserById(currentUser.id);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-white">Perfil</h2>
        <p className="mt-2 text-sm text-white/70">Actualiza el nombre que mostraremos en tu area personal.</p>
      </header>

      <ProfileForm
        initialName={persistedUser?.name ?? currentUser.name ?? ""}
        email={persistedUser?.email ?? currentUser.email}
      />
    </div>
  );
}