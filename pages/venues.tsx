import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../utils/supabase';
import { useVenuesStore } from '../store/venuesStore';
import Image from 'next/image';

interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  dayprice: number;
  image_url?: string;
  created_at: string;
}

const VenuesPage = () => {
  const { venues, loading, fetchVenues } = useVenuesStore();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | '';
  }>({ message: '', type: '' });

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // const handleDownloadPDF = async (venue: Venue) => {
  //   try {
  //     const pdfLib = await import('pdf-lib');      const pdfDoc = await pdfLib.PDFDocument.create();
  //     const page = pdfDoc.addPage([595, 842]); // A4 size
  //     const helvetica = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);
  //     const helveticaBold = await pdfDoc.embedFont(pdfLib.StandardFonts.HelveticaBold);

  //     // Header with blue background
  //     page.drawRectangle({
  //       x: 0,
  //       y: 792,
  //       width: 595,
  //       height: 50,
  //       color: pdfLib.rgb(0.23, 0.38, 0.85), // Indigo color
  //     });

  //     // Title
  //     page.drawText('VENUE DETAILS', {
  //       x: 50,
  //       y: 810,
  //       size: 24,
  //       font: helveticaBold,
  //       color: pdfLib.rgb(1, 1, 1)
  //     });

  //     // Venue name with underline
  //     page.drawText(venue.name, {
  //       x: 50,
  //       y: 750,
  //       size: 20,
  //       font: helveticaBold,
  //       color: pdfLib.rgb(0.23, 0.38, 0.85)
  //     });
  //     page.drawLine({
  //       start: { x: 50, y: 745 },
  //       end: { x: 545, y: 745 },
  //       thickness: 1,
  //       color: pdfLib.rgb(0.8, 0.8, 0.8)
  //     });

  //     // Details section
  //     const details = [
  //       { label: 'Address', value: venue.address },
  //       { label: 'Capacity', value: `${venue.capacity} people` },
  //       { label: 'Day Price', value: `$${venue.dayprice}` }
  //     ];

  //     let yPosition = 700;
  //     details.forEach(({ label, value }) => {
  //       page.drawText(label + ':', {
  //         x: 50,
  //         y: yPosition,
  //         size: 12,
  //         font: helveticaBold,
  //         color: pdfLib.rgb(0.3, 0.3, 0.3)
  //       });
  //       page.drawText(value.toString(), {
  //         x: 150,
  //         y: yPosition,
  //         size: 12,
  //         font: helvetica,
  //         color: pdfLib.rgb(0, 0, 0)
  //       });
  //       yPosition -= 30;
  //     });

  //     // Image section
  //     if (venue.image_url) {
  //       try {
  //         const imgBytes = await fetch(venue.image_url).then(res => res.arrayBuffer());
  //         let image;
  //         if (venue.image_url.endsWith('.png')) {
  //           image = await pdfDoc.embedPng(imgBytes);
  //         } else {
  //           image = await pdfDoc.embedJpg(imgBytes);
  //         }

  //         // Add image title
  //         page.drawText('Venue Image:', {
  //           x: 50,
  //           y: yPosition,
  //           size: 12,
  //           font: helveticaBold,
  //           color: pdfLib.rgb(0.3, 0.3, 0.3)
  //         });

  //         // Calculate aspect ratio for image
  //         const imgWidth = 300;
  //         const imgHeight = (image.height / image.width) * imgWidth;

  //         page.drawImage(image, {
  //           x: 50,
  //           y: yPosition - imgHeight - 10,
  //           width: imgWidth,
  //           height: imgHeight
  //         });
  //       } catch {}
  //     }

  //     const pdfBytes = await pdfDoc.save();
  //     const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `${venue.name}-info.pdf`;
  //     a.click();
  //     URL.revokeObjectURL(url);
  //     setToast({ message: 'PDF downloaded!', type: 'success' });
  //   } catch {
  //     setToast({ message: 'PDF download failed.', type: 'error' });
  //   }
  // };

  useEffect(() => {
    if (toast.message) {
      const t = setTimeout(() => setToast({ message: '', type: '' }), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <Layout title="Venues">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-xl shadow-lg p-4 fl-co-st-st h-full focus-within:ring-2 focus-within:ring-indigo-400"
              tabIndex={0}
              aria-label={`Venue: ${venue.name}`}
            >
              <div className="relative w-full h-40 mb-3">
                {venue.image_url && (
                  <Image
                    src={venue.image_url}
                    alt={venue.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
              </div>

              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  venue.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {venue.available ? 'Available' : 'Not Available'}
              </span>

              <h2
                className="text-xl font-semibold mb-1 text-indigo-700"
                tabIndex={0}
              >
                {venue.name}
              </h2>

              <p className="mb-1 text-gray-700">
                <b>Address:</b>
                {venue.address}
              </p>

              <p className="mb-1 text-gray-700">
                <b>Capacity:</b>
                {venue.capacity}
              </p>

              <p className="mb-2 text-indigo-700 font-semibold">
                <b>Day Price:</b>
                {venue.dayprice}
              </p>

              <div className="mt-auto fl-co-st-st gap-2 sm:flex-row">
                {venue.available && (
                  <a
                    href={`/venues/${venue.id}`}
                    className="px-5 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center text-base"
                    aria-label={`View details for ${venue.name}`}
                  >
                    View Details
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {toast.message && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        )}
        {loading && (
          <div className="fl-ro-ce-ce py-12" role="status" aria-live="polite">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading spinner"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VenuesPage;
