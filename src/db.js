/**
 * Universal Database Adapter for Cloudflare Workers (D1)
 *
 * 1. When running on Cloudflare Workers, queries the serverless D1 database binding (`c.env.DB`).
 * 2. When running in environments without D1, falls back to a memory store.
 */

// In-memory fallback if D1 binding is not yet attached
let memoryStore = {
  users: [
    { username: 'admin', password_hash: 'admin', role: 'admin', is_approved: 1, is_suspended: 0 }
  ],
  countries: [],
  plots: [],
  inquiries: [],
  plot_views: [],
  notifications: []
};

export function getDb(env) {
  // 1. Cloudflare Workers D1 Mode (Production)
  if (env && env.DB) {
    const d1 = env.DB;
    return {
      async query(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        const result = await stmt.all();
        return result.results || [];
      },
      async queryFirst(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        return await stmt.first();
      },
      async execute(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        return await stmt.run();
      }
    };
  }

  // 2. Pure In-Memory Edge Fallback (Zero Node.js 'fs'/'path' dependencies)
  return {
    async query(sql, params = []) {
      const s = sql.trim().toUpperCase();

      if (s.startsWith('SELECT * FROM COUNTRIES')) {
        if (s.includes('WHERE ID =')) return memoryStore.countries.filter(c => c.id === params[0]);
        return [...memoryStore.countries];
      }

      if (s.startsWith('SELECT * FROM PLOTS')) {
        if (s.includes('WHERE COUNTRY_ID =')) return memoryStore.plots.filter(p => p.country_id === params[0]);
        if (s.includes('WHERE OWNER_USERNAME =')) return memoryStore.plots.filter(p => p.owner_username === params[0]);
        return [...memoryStore.plots];
      }

      if (s.startsWith('SELECT ID FROM PLOTS')) {
        if (s.includes('WHERE OWNER_USERNAME =')) {
          return memoryStore.plots.filter(p => p.owner_username === params[0]).map(p => ({ id: p.id }));
        }
        return memoryStore.plots.map(p => ({ id: p.id }));
      }

      if (s.startsWith('SELECT * FROM USERS')) {
        if (s.includes('WHERE IS_APPROVED = 0')) return memoryStore.users.filter(u => !u.is_approved);
        if (s.includes('WHERE USERNAME !=')) return memoryStore.users.filter(u => u.username !== params[0]);
        return [...memoryStore.users];
      }

      if (s.startsWith('SELECT * FROM NOTIFICATIONS')) {
        return [...memoryStore.notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      if (s.startsWith('SELECT I.*')) {
        let inqs = [...memoryStore.inquiries];
        if (s.includes('WHERE P.OWNER_USERNAME =')) {
          const ownerPlotIds = new Set(memoryStore.plots.filter(p => p.owner_username === params[0]).map(p => p.id));
          inqs = inqs.filter(i => ownerPlotIds.has(i.plot_id));
        } else if (s.includes('WHERE I.PLOT_ID IN')) {
          const allowedIds = new Set(params);
          inqs = inqs.filter(i => allowedIds.has(i.plot_id));
        }
        return inqs.map(i => {
          const plot = memoryStore.plots.find(p => p.id === i.plot_id);
          const country = plot ? memoryStore.countries.find(c => c.id === plot.country_id) : null;
          return {
            ...i,
            plot_title: plot ? plot.title : 'Unknown Plot',
            country_name: country ? country.name : 'Unknown'
          };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      return [];
    },

    async queryFirst(sql, params = []) {
      const s = sql.trim().toUpperCase();

      if (s.startsWith('SELECT * FROM USERS WHERE USERNAME =')) {
        return memoryStore.users.find(u => u.username === params[0]) || null;
      }
      if (s.startsWith('SELECT * FROM COUNTRIES WHERE ID =')) {
        return memoryStore.countries.find(c => c.id === params[0]) || null;
      }
      if (s.startsWith('SELECT * FROM PLOTS WHERE ID =')) {
        return memoryStore.plots.find(p => p.id === params[0]) || null;
      }
      if (s.startsWith('SELECT * FROM INQUIRIES WHERE ID =')) {
        return memoryStore.inquiries.find(i => i.id === params[0]) || null;
      }
      if (s.startsWith('SELECT * FROM NOTIFICATIONS WHERE ID =')) {
        return memoryStore.notifications.find(n => n.id === params[0]) || null;
      }

      if (s.includes('COUNT(*) AS COUNT FROM PLOT_VIEWS')) {
        let views = memoryStore.plot_views;
        if (s.includes('AND TIMESTAMP LIKE')) {
          const datePrefix = params[params.length - 1].replace('%', '');
          const plotIds = new Set(params.slice(0, -1));
          views = views.filter(v => plotIds.has(v.plot_id) && v.timestamp.startsWith(datePrefix));
        } else if (s.includes('WHERE PLOT_ID IN')) {
          const plotIds = new Set(params);
          views = views.filter(v => plotIds.has(v.plot_id));
        }
        return { count: views.length };
      }

      const res = await this.query(sql, params);
      return res.length > 0 ? res[0] : null;
    },

    async execute(sql, params = []) {
      const s = sql.trim().toUpperCase();

      if (s.startsWith('INSERT INTO USERS')) {
        const [username, password_hash, role, is_approved, is_suspended] = params;
        memoryStore.users.push({ username, password_hash, role, is_approved, is_suspended });
        return;
      }

      if (s.startsWith('INSERT INTO COUNTRIES')) {
        const [id, name, flag, motto, accent, desc, video_url, highlights, potential_neighborhoods, culture_info, is_visible] = params;
        memoryStore.countries.push({
          id, name, flag, motto, accent, desc, video_url,
          highlights, potential_neighborhoods, culture_info, is_visible
        });
        return;
      }

      if (s.startsWith('UPDATE COUNTRIES SET')) {
        if (s.includes('IS_VISIBLE = ?')) {
          const [nextVis, cid] = params;
          const country = memoryStore.countries.find(c => c.id === cid);
          if (country) country.is_visible = nextVis;
        } else {
          const [motto, desc, video_url, accent, flag, highlights, potential_neighborhoods, culture_info, id] = params;
          const country = memoryStore.countries.find(c => c.id === id);
          if (country) Object.assign(country, { motto, desc, video_url, accent, flag, highlights, potential_neighborhoods, culture_info });
        }
        return;
      }

      if (s.startsWith('INSERT INTO PLOTS')) {
        const [id, title, size, price, neighborhood, owner_username, country_id, photos, is_visible] = params;
        memoryStore.plots.push({ id, title, size, price, neighborhood, owner_username, country_id, photos, is_visible });
        return;
      }

      if (s.startsWith('UPDATE PLOTS SET')) {
        if (s.includes('IS_VISIBLE = ?')) {
          const [nextVis, pid] = params;
          const plot = memoryStore.plots.find(p => p.id === pid);
          if (plot) plot.is_visible = nextVis;
        } else {
          const [title, size, price, neighborhood, photos, id] = params;
          const plot = memoryStore.plots.find(p => p.id === id);
          if (plot) Object.assign(plot, { title, size, price, neighborhood, photos });
        }
        return;
      }

      if (s.startsWith('DELETE FROM PLOTS WHERE ID =')) {
        memoryStore.plots = memoryStore.plots.filter(p => p.id !== params[0]);
        return;
      }

      if (s.startsWith('DELETE FROM PLOTS WHERE OWNER_USERNAME =')) {
        memoryStore.plots = memoryStore.plots.filter(p => p.owner_username !== params[0]);
        return;
      }

      if (s.startsWith('INSERT INTO INQUIRIES')) {
        const [id, plot_id, full_name, email, phone, current_city, message, type, timestamp] = params;
        memoryStore.inquiries.push({ id, plot_id, full_name, email, phone, current_city, message, type, timestamp });
        return;
      }

      if (s.startsWith('INSERT INTO PLOT_VIEWS')) {
        const [plot_id, timestamp] = params;
        memoryStore.plot_views.push({ id: memoryStore.plot_views.length + 1, plot_id, timestamp });
        return;
      }

      if (s.startsWith('INSERT INTO NOTIFICATIONS')) {
        const [id, message, read, timestamp] = params;
        memoryStore.notifications.push({ id, message, read, timestamp });
        return;
      }

      if (s.startsWith('UPDATE NOTIFICATIONS SET READ = 1 WHERE ID = ?')) {
        const notif = memoryStore.notifications.find(n => n.id === params[0]);
        if (notif) notif.read = 1;
        return;
      }

      if (s.startsWith('UPDATE USERS SET IS_APPROVED = 1 WHERE USERNAME = ?')) {
        const u = memoryStore.users.find(user => user.username === params[0]);
        if (u) u.is_approved = 1;
        return;
      }

      if (s.startsWith('UPDATE USERS SET IS_SUSPENDED = ? WHERE USERNAME = ?')) {
        const [susp, uname] = params;
        const u = memoryStore.users.find(user => user.username === uname);
        if (u) u.is_suspended = susp;
        return;
      }

      if (s.startsWith('DELETE FROM USERS WHERE USERNAME = ?')) {
        memoryStore.users = memoryStore.users.filter(u => u.username !== params[0]);
        return;
      }

      if (s.startsWith('DELETE FROM')) {
        if (s.includes('PLOT_VIEWS')) memoryStore.plot_views = [];
        if (s.includes('INQUIRIES')) memoryStore.inquiries = [];
        if (s.includes('PLOTS')) memoryStore.plots = [];
        if (s.includes('COUNTRIES')) memoryStore.countries = [];
        if (s.includes('NOTIFICATIONS')) memoryStore.notifications = [];
        if (s.includes('USERS')) memoryStore.users = [];
      }
    }
  };
}
