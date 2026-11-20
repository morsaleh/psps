/**
 * PsPs Supabase Service Layer
 * مدیریت احراز هویت، دیتابیس گزارش‌ها، آپلود تصویر (Storage)، Realtime، نظارت (Moderation) و همکاران (دامپزشکی/پت‌شاپ)
 */
(function () {
  "use strict";

  const CFG = window.PSPS_CONFIG || {};
  const isConfigured = Boolean(
    CFG.SUPABASE_URL &&
    CFG.SUPABASE_ANON_KEY &&
    !CFG.SUPABASE_URL.includes("YOUR-PROJECT-ID") &&
    !CFG.SUPABASE_ANON_KEY.includes("YOUR-SUPABASE-ANON")
  );

  let client = null;
  let currentUser = null;
  let currentProfile = null;
  let realtimeChannel = null;

  const DEMO_PARTNERS = [
    {
      id: "demo-partner-1",
      kind: "clinic_24h",
      name: "کلینیک دامپزشکی شبانه‌روزی نمونه",
      city: "تهران",
      address: "تهران، محدودهٔ بلوار کشاورز، پلاک ۱۲",
      lat: 35.7082,
      lng: 51.3945,
      phone: "02188990011",
      website: "https://example.com",
      instagram: "psps_vet_demo",
      working_hours: "شبانه‌روزی (۲۴ ساعته)",
      discount_code: "PSPS15",
      discount_text: "۱۵٪ تخفیف ویزیت گربه‌های حمایتی با کد PSPS15",
      is_verified: true,
      is_featured: true,
      status: "active"
    },
    {
      id: "demo-partner-2",
      kind: "petshop",
      name: "پت‌شاپ مهربان (نمونه)",
      city: "تهران",
      address: "تهران، خیابان ولیعصر، نزدیک پارک لاله",
      lat: 35.7121,
      lng: 51.4012,
      phone: "02188990022",
      website: "https://example.com",
      instagram: "psps_petshop_demo",
      working_hours: "۹ تا ۲۲",
      discount_code: "PSPSFOOD",
      discount_text: "۱۰٪ تخفیف غذای خشک حمایتی",
      is_verified: true,
      is_featured: false,
      status: "active"
    }
  ];

  function mapReportRow(row) {
    const uid = currentUser ? currentUser.id : null;
    const events = (row.report_events || [])
      .slice()
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((ev) => ({
        id: ev.id,
        at: ev.created_at,
        text: ev.text,
        kind: ev.kind,
        mine: Boolean(uid && ev.author_id === uid)
      }));

    return {
      id: row.id,
      authorId: row.author_id,
      mine: Boolean(uid && row.author_id === uid),
      type: Number(row.cat_type || 0),
      name: row.name,
      city: row.city || "تهران",
      address: row.address,
      lat: Number(row.lat),
      lng: Number(row.lng),
      seen: row.seen_at,
      created: row.created_at,
      condition: row.condition,
      description: row.description,
      given: row.given,
      needs: Array.isArray(row.needs) ? row.needs : [],
      needText: row.need_text || "",
      urgent: Boolean(row.urgent),
      status: row.status || "open",
      goingUserId: row.going_user_id || null,
      goingByMe: Boolean(uid && row.going_user_id === uid && row.status === "going"),
      photo: row.photo_url || null,
      photoPath: row.photo_path || null,
      moderationStatus: row.moderation_status || "approved",
      flagsCount: Number(row.flags_count || 0),
      events
    };
  }

  async function loadProfile(user) {
    if (!client || !user) {
      currentProfile = null;
      return null;
    }
    const { data, error } = await client
      .from("profiles")
      .select("id, display_name, city, role, is_banned")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.warn("PsPs profile fetch warning:", error.message);
      currentProfile = {
        id: user.id,
        display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "آدمیوزاد",
        city: user.user_metadata?.city || "تهران",
        role: "user",
        is_banned: false
      };
      return currentProfile;
    }
    currentProfile = data;
    return data;
  }

  const PsPsBackend = {
    isLive: isConfigured,
    get user() { return currentUser; },
    get profile() { return currentProfile; },
    get isModerator() {
      return Boolean(currentProfile && (currentProfile.role === "moderator" || currentProfile.role === "admin"));
    },

    async init(onAuthChange) {
      if (!isConfigured) {
        if (onAuthChange) onAuthChange(null, null);
        return { live: false };
      }
      try {
        const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
        client = mod.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        const { data: sessionData } = await client.auth.getSession();
        currentUser = sessionData?.session?.user || null;
        if (currentUser) await loadProfile(currentUser);
        if (onAuthChange) onAuthChange(currentUser, currentProfile);

        client.auth.onAuthStateChange(async (_event, session) => {
          currentUser = session?.user || null;
          if (currentUser) await loadProfile(currentUser);
          else currentProfile = null;
          if (onAuthChange) onAuthChange(currentUser, currentProfile);
        });
        return { live: true };
      } catch (err) {
        console.error("Supabase init failed:", err);
        this.isLive = false;
        if (onAuthChange) onAuthChange(null, null);
        return { live: false, error: err };
      }
    },

    async signUp(email, password, displayName, city) {
      if (!client) throw new Error("اتصال به Supabase فعال نیست.");
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || "آدمیوزاد مهربان", city: city || "تهران" },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    },

    async signIn(email, password) {
      if (!client) throw new Error("اتصال به Supabase فعال نیست.");
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    async signInMagicLink(email) {
      if (!client) throw new Error("اتصال به Supabase فعال نیست.");
      const { data, error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      if (!client) return;
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },

    async fetchReports({ city = "همه شهرها", includeModeration = false } = {}) {
      if (!client) return null;
      let query = client
        .from("cat_reports")
        .select("*, report_events(id, author_id, kind, text, created_at)")
        .order("created_at", { ascending: false })
        .limit(250);

      if (!includeModeration) {
        query = query.eq("moderation_status", "approved");
      }
      if (city && city !== "همه شهرها") {
        query = query.eq("city", city);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapReportRow);
    },

    async uploadPhotoBlob(blob) {
      if (!client || !currentUser) throw new Error("برای آپلود تصویر باید وارد حساب کاربری شوی.");
      const bucket = CFG.STORAGE_BUCKET || "cat-photos";
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      const fileId = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `${currentUser.id}/${fileId}.${ext}`;

      const { error: uploadErr } = await client.storage
        .from(bucket)
        .upload(path, blob, { contentType: blob.type || "image/jpeg", cacheControl: "31536000", upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
      return { publicUrl: pub.publicUrl, path };
    },

    async createReport(payload) {
      if (!client || !currentUser) throw new Error("برای ثبت گزارش، ابتدا وارد حساب کاربری شو.");
      const row = {
        author_id: currentUser.id,
        name: payload.name,
        city: payload.city || "تهران",
        address: payload.address,
        lat: payload.lat,
        lng: payload.lng,
        seen_at: payload.seen,
        condition: payload.condition,
        description: payload.description,
        given: payload.given,
        needs: payload.needs,
        need_text: payload.needText,
        urgent: payload.urgent,
        status: "open",
        photo_url: payload.photoUrl || null,
        photo_path: payload.photoPath || null,
        cat_type: payload.type || 0
      };
      const { data, error } = await client
        .from("cat_reports")
        .insert(row)
        .select("*, report_events(id, author_id, kind, text, created_at)")
        .single();
      if (error) throw error;
      return mapReportRow(data);
    },

    async toggleGoing(report) {
      if (!client || !currentUser) throw new Error("برای اعلام حضور، ابتدا وارد حساب کاربری شو.");
      const nextGoing = !report.goingByMe;
      const nextStatus = nextGoing ? "going" : "open";

      const { error: upErr } = await client
        .from("cat_reports")
        .update({
          status: nextStatus,
          going_user_id: nextGoing ? currentUser.id : null
        })
        .eq("id", report.id);
      if (upErr) throw upErr;

      const { error: evErr } = await client.from("report_events").insert({
        report_id: report.id,
        author_id: currentUser.id,
        kind: nextGoing ? "آدمیوزاد در راه است" : "لغو اعلام حضور",
        text: nextGoing
          ? "برای بررسی شرایط اعلام حضور کردم."
          : "اعلام حضورم را لغو کردم؛ به آدمیوزاد دیگری نیاز است."
      });
      if (evErr) throw evErr;
      return { nextGoing, nextStatus };
    },

    async addReportUpdate(report, { text, sawAgain, needs, needText, resolved }) {
      if (!client || !currentUser) throw new Error("برای ثبت پیگیری، ابتدا وارد حساب کاربری شو.");
      const nowIso = new Date().toISOString();
      const updatePatch = {
        needs: resolved ? [] : needs,
        need_text: resolved ? "نیاز ثبت‌شده فعلاً برطرف شده است." : needText,
        status: resolved ? "done" : (report.goingByMe ? "going" : report.status === "done" ? "open" : report.status)
      };
      if (sawAgain) updatePatch.seen_at = nowIso;
      if (resolved) updatePatch.going_user_id = null;

      const { error: upErr } = await client
        .from("cat_reports")
        .update(updatePatch)
        .eq("id", report.id);
      if (upErr) throw upErr;

      const { error: evErr } = await client.from("report_events").insert({
        report_id: report.id,
        author_id: currentUser.id,
        kind: resolved ? "نیاز فعلی برطرف شد" : "به‌روزرسانی وضعیت",
        text
      });
      if (evErr) throw evErr;
    },

    async flagReport(reportId, reason, details) {
      if (!client || !currentUser) throw new Error("برای ثبت گزارش تخلف، ابتدا وارد حساب کاربری شو.");
      const { error } = await client.from("report_flags").insert({
        report_id: reportId,
        reporter_id: currentUser.id,
        reason,
        details: details || ""
      });
      if (error) {
        if (error.code === "23505") throw new Error("شما قبلاً این پرونده را گزارش داده‌اید.");
        throw error;
      }
    },

    async moderateReport(reportId, moderationStatus) {
      if (!client || !this.isModerator) throw new Error("دسترسی ناظر لازم است.");
      const { error } = await client
        .from("cat_reports")
        .update({ moderation_status: moderationStatus })
        .eq("id", reportId);
      if (error) throw error;
    },

    async deleteReport(reportId, photoPath) {
      if (!client || !currentUser) throw new Error("ورود به حساب کاربری لازم است.");
      const { error } = await client.from("cat_reports").delete().eq("id", reportId);
      if (error) throw error;
      if (photoPath) {
        await client.storage.from(CFG.STORAGE_BUCKET || "cat-photos").remove([photoPath]).catch(() => {});
      }
    },

    subscribeRealtime(onChange) {
      if (!client) return;
      if (realtimeChannel) {
        client.removeChannel(realtimeChannel);
      }
      realtimeChannel = client
        .channel("psps-live-feed")
        .on("postgres_changes", { event: "*", schema: "public", table: "cat_reports" }, () => onChange && onChange())
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "report_events" }, () => onChange && onChange())
        .subscribe();
    },

    async fetchPartners(city = "همه شهرها") {
      if (!client) {
        return CFG.FEATURES?.PARTNERS_DEMO_PREVIEW
          ? DEMO_PARTNERS.filter((p) => city === "همه شهرها" || p.city === city)
          : [];
      }
      let q = client
        .from("partner_places")
        .select("*")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("priority_rank", { ascending: false });
      if (city && city !== "همه شهرها") q = q.eq("city", city);
      const { data, error } = await q;
      if (error) {
        console.warn("Partner fetch warning:", error.message);
        return [];
      }
      return data || [];
    },

    async trackPartnerClick(partnerId, actionType, reportId = null) {
      if (!client || String(partnerId).startsWith("demo-")) return;
      await client.from("partner_clicks").insert({
        partner_id: partnerId,
        user_id: currentUser ? currentUser.id : null,
        report_id: reportId,
        action_type: actionType
      }).catch(() => {});
    }
  };

  window.PsPsBackend = PsPsBackend;
})();
