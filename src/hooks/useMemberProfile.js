import { useEffect, useState } from "react";
import { getMyProfile } from "@/services/memberService";

/** The signed-in member's profile, or null before one exists. */
export default function useMemberProfile(email) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(email));

  useEffect(() => {
    let cancelled = false;
    if (!email) {
      setProfile(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    getMyProfile(email)
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  return { profile, loading };
}