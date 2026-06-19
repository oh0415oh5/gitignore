import { useEffect } from "react";
import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { api } from "../convex/_generated/api";

export default function App() {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Convex Auth</h1>
          <p>WorkOS AuthKit with user management and access control.</p>
        </div>
        <button
          type="button"
          onClick={() => (user ? void signOut() : void signIn())}
        >
          {user ? "Sign out" : "Sign in"}
        </button>
      </header>

      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>

      <Unauthenticated>
        <section className="card">
          <p>Sign in to create your Convex user record and view your profile.</p>
        </section>
      </Unauthenticated>
    </div>
  );
}

function AuthenticatedContent() {
  const { isLoading } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);
  const currentUser = useQuery(api.users.getViewer);

  useEffect(() => {
    if (!isLoading) {
      void storeUser();
    }
  }, [isLoading, storeUser]);

  if (isLoading || currentUser === undefined || currentUser === null) {
    return (
      <section className="card">
        <p>Loading your profile...</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Welcome, {currentUser.name}</h2>
      <dl className="profile">
        <div>
          <dt>Email</dt>
          <dd>{currentUser.email || "Not provided"}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{currentUser.role}</dd>
        </div>
        <div>
          <dt>User ID</dt>
          <dd>{currentUser._id}</dd>
        </div>
      </dl>
    </section>
  );
}
