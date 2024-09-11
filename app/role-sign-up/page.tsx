"use client"; // Mark this as a Client Component

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function RoleSignUpPage() {
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // Initialize Supabase client
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user already has a role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single();

        if (roleError) {
          setError(roleError.message);
          setLoading(false);
          return;
        }

        if (roleData) {
          // User already has a role, redirect to home page
          router.push('/');
          return;
        }
      }
      
      setLoading(false);
    };

    fetchUser();
  }, [supabase, router]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      setError("User is not authenticated.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role
        });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect based on role
      if (role === "ad") {
        router.push('/admin/dashboard'); // Redirect to Admin Dashboard
      } else if (role === "st") {
        router.push('/learner/dashboard'); // Redirect to Student Dashboard
      } else if (role === "in") {
        router.push('/instructor/dashboard'); // Redirect to Instructor Dashboard
      } else {
        router.push('/'); // Default redirect
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-4">
      <h1 className="text-2xl font-bold mb-4">Sign Up for a Role</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="role" className="font-bold text-lg">Select Role</label>
        <select
          id="role"
          value={role}
          onChange={handleRoleChange}
          className="p-2 border rounded"
          required
        >
          <option value="">Select a role</option>
          <option value="ad">Admin</option>
          <option value="st">Student</option>
          <option value="in">Instructor</option>
        </select>
        <button
          type="submit"
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
