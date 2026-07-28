import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Globe } from 'lucide-react';
import client from '../api/client';

import TemplateA_Ecommerce from '../templates/TemplateA_Ecommerce';
import TemplateB_Booking from '../templates/TemplateB_Booking';
import TemplateC_Landing from '../templates/TemplateC_Landing';

export default function SiteRenderer() {
  const { businessSlug } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const { data } = await client.get(`/tenant/slug/${businessSlug}`);
        setTenant(data);
      } catch (err) {
        console.error('Error fetching tenant:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (businessSlug) {
      fetchTenantData();
    }
  }, [businessSlug]);

  useEffect(() => {
    if (tenant) {
      // Record Page View
      client.post(`/tenant/slug/${tenant.businessSlug}/view`).catch(() => {});

      // Apply SEO Meta Tags
      if (tenant.metaTitle) {
        document.title = tenant.metaTitle;
      } else {
        document.title = tenant.businessName;
      }

      if (tenant.metaDescription) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = tenant.metaDescription;
      }

      if (tenant.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = tenant.faviconUrl;
      }
    }
  }, [tenant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-primary-500 font-medium">Loading site...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle size={64} className="text-accent-500 mb-6" />
        <h1 className="text-4xl font-display font-bold text-primary-900 mb-4">Site Not Found</h1>
        <p className="text-lg text-primary-600 max-w-md mb-8">
          We couldn't find a website matching <strong className="text-primary-900">/{businessSlug}</strong>. It may have been removed or the URL is incorrect.
        </p>
        <Link to="/" className="btn-primary">
          <Globe size={18} /> Return to BizWiz
        </Link>
      </div>
    );
  }

  // Render the appropriate template based on themeType
  switch (tenant.themeType) {
    case 'ecommerce':
      return <TemplateA_Ecommerce data={tenant} />;
    case 'booking':
      return <TemplateB_Booking data={tenant} />;
    case 'landing':
      return <TemplateC_Landing data={tenant} />;
    default:
      return <TemplateA_Ecommerce data={tenant} />;
  }
}
