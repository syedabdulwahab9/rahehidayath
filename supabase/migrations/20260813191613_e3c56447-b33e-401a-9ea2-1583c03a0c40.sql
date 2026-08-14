-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- daily progress
CREATE TABLE public.daily_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day DATE NOT NULL,
  prayers TEXT[] NOT NULL DEFAULT '{}',
  quran_pages INTEGER NOT NULL DEFAULT 0,
  dhikr INTEGER NOT NULL DEFAULT 0,
  good_deeds INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  fasting BOOLEAN NOT NULL DEFAULT false,
  tahajjud BOOLEAN NOT NULL DEFAULT false,
  sadaqah BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_progress TO authenticated;
GRANT ALL ON public.daily_progress TO service_role;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_progress_own" ON public.daily_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- families
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT ALL ON public.families TO service_role;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  share_salah BOOLEAN NOT NULL DEFAULT true,
  share_quran BOOLEAN NOT NULL DEFAULT true,
  share_dhikr BOOLEAN NOT NULL DEFAULT true,
  share_deeds BOOLEAN NOT NULL DEFAULT true,
  share_fasting BOOLEAN NOT NULL DEFAULT true,
  share_tahajjud BOOLEAN NOT NULL DEFAULT true,
  share_sadaqah BOOLEAN NOT NULL DEFAULT true,
  share_streak BOOLEAN NOT NULL DEFAULT true,
  share_last_active BOOLEAN NOT NULL DEFAULT true,
  hide_prayer_times BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (family_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.my_family_ids()
RETURNS UUID[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(array_agg(family_id), '{}') FROM public.family_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_family_member(_family_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.family_members WHERE family_id = _family_id AND user_id = _user_id);
$$;

CREATE POLICY "families_read_mine" ON public.families FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR id = ANY (public.my_family_ids()));
CREATE POLICY "families_insert" ON public.families FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "families_update_owner" ON public.families FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "members_read_circle" ON public.family_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR family_id = ANY (public.my_family_ids()));
CREATE POLICY "members_insert_self" ON public.family_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_update_self" ON public.family_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_delete_self" ON public.family_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- encouragements
CREATE TABLE public.encouragements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  from_user UUID NOT NULL,
  to_user UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encouragements TO authenticated;
GRANT ALL ON public.encouragements TO service_role;
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "encouragements_read_circle" ON public.encouragements FOR SELECT TO authenticated
  USING (family_id = ANY (public.my_family_ids()));
CREATE POLICY "encouragements_insert" ON public.encouragements FOR INSERT TO authenticated
  WITH CHECK (from_user = auth.uid() AND family_id = ANY (public.my_family_ids()));
CREATE POLICY "encouragements_delete_own" ON public.encouragements FOR DELETE TO authenticated USING (from_user = auth.uid());

-- quran teacher tables
CREATE TABLE public.quran_sessions (
  user_id UUID PRIMARY KEY,
  surah INTEGER NOT NULL DEFAULT 1,
  ayah INTEGER NOT NULL DEFAULT 1,
  word_index INTEGER NOT NULL DEFAULT 0,
  page INTEGER NOT NULL DEFAULT 1,
  line INTEGER NOT NULL DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'read',
  qari TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'en',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_sessions TO authenticated;
GRANT ALL ON public.quran_sessions TO service_role;
ALTER TABLE public.quran_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quran_sessions_own" ON public.quran_sessions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.quran_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  pages INTEGER NOT NULL DEFAULT 0,
  ayat INTEGER NOT NULL DEFAULT 0,
  words INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  pronunciation_accuracy NUMERIC NOT NULL DEFAULT 0,
  tajweed_accuracy NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_progress TO authenticated;
GRANT ALL ON public.quran_progress TO service_role;
ALTER TABLE public.quran_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quran_progress_own" ON public.quran_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.quran_mistakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah INTEGER NOT NULL,
  ayah INTEGER NOT NULL,
  word TEXT NOT NULL DEFAULT '',
  word_index INTEGER NOT NULL DEFAULT 0,
  rule TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'minor',
  explanation TEXT NOT NULL DEFAULT '',
  corrected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_mistakes TO authenticated;
GRANT ALL ON public.quran_mistakes TO service_role;
ALTER TABLE public.quran_mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quran_mistakes_own" ON public.quran_mistakes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- dua wall
CREATE TABLE public.dua_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  language TEXT NOT NULL DEFAULT 'en',
  dua_count INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dua_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dua_requests TO authenticated;
GRANT ALL ON public.dua_requests TO service_role;
ALTER TABLE public.dua_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dua_requests_read_published" ON public.dua_requests FOR SELECT USING (published = true);
CREATE POLICY "dua_requests_insert" ON public.dua_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "dua_requests_update_own" ON public.dua_requests FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "dua_requests_delete_own" ON public.dua_requests FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.dua_amens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.dua_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);
GRANT SELECT ON public.dua_amens TO anon;
GRANT SELECT, INSERT, DELETE ON public.dua_amens TO authenticated;
GRANT ALL ON public.dua_amens TO service_role;
ALTER TABLE public.dua_amens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dua_amens_read" ON public.dua_amens FOR SELECT USING (true);
CREATE POLICY "dua_amens_insert_own" ON public.dua_amens FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "dua_amens_delete_own" ON public.dua_amens FOR DELETE TO authenticated USING (user_id = auth.uid());

-- shared site state / admin bookkeeping
CREATE TABLE public.app_state (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_state TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_state TO authenticated;
GRANT ALL ON public.app_state TO service_role;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_state_read" ON public.app_state FOR SELECT USING (true);
CREATE POLICY "app_state_write" ON public.app_state FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.admin_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_emails TO authenticated;
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_emails_read" ON public.admin_emails FOR SELECT TO authenticated USING (true);

CREATE TABLE public.admin_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_activity TO authenticated;
GRANT ALL ON public.admin_activity TO service_role;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_activity_read" ON public.admin_activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_activity_insert" ON public.admin_activity FOR INSERT TO authenticated WITH CHECK (true);

-- circle helpers
CREATE OR REPLACE FUNCTION public.create_family(_name TEXT)
RETURNS SETOF public.families LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _code TEXT;
  _fam public.families;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  _code := upper(regexp_replace(left(coalesce(nullif(trim(_name), ''), 'FAMILY'), 8), '[^a-zA-Z]', '', 'g'));
  IF _code = '' THEN _code := 'FAMILY'; END IF;
  _code := _code || '-' || lpad((1000 + floor(random() * 9000))::int::text, 4, '0');

  INSERT INTO public.families (name, invite_code, created_by)
  VALUES (trim(_name), _code, _uid)
  RETURNING * INTO _fam;

  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (_fam.id, _uid, 'owner');

  RETURN NEXT _fam;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_family_by_code(_code TEXT)
RETURNS SETOF public.families LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _fam public.families;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO _fam FROM public.families WHERE upper(invite_code) = upper(trim(_code));
  IF _fam.id IS NULL THEN RAISE EXCEPTION 'No family circle with that code'; END IF;

  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (_fam.id, _uid, 'member')
  ON CONFLICT (family_id, user_id) DO NOTHING;

  RETURN NEXT _fam;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_family_progress(_since DATE)
RETURNS SETOF public.daily_progress LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT dp.* FROM public.daily_progress dp
  WHERE dp.day >= _since
    AND dp.user_id IN (
      SELECT fm.user_id FROM public.family_members fm
      WHERE fm.family_id = ANY (public.my_family_ids())
    );
$$;

GRANT EXECUTE ON FUNCTION public.create_family(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_family_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_family_progress(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_family_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_family_member(UUID, UUID) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.encouragements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_progress;