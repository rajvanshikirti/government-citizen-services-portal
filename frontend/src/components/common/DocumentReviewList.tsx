import { useState } from 'react';
import { CheckCircle, Eye, FileText } from 'lucide-react';
import { Button } from './Button';
import { documentsApi } from '../../services/endpoints';
import type { Document } from '../../types';

interface DocumentReviewListProps {
  documents: Document[];
  canVerify?: boolean;
  onVerified?: (documentId: string) => void;
}

export function DocumentReviewList({ documents, canVerify = false, onVerified }: DocumentReviewListProps) {
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleView = async (doc: Document) => {
    setError('');
    setViewingId(doc.id);
    try {
      const res = await documentsApi.view(doc.id);
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError('Unable to open document. Please try again.');
    } finally {
      setViewingId(null);
    }
  };

  const handleVerify = async (doc: Document) => {
    setError('');
    setVerifyingId(doc.id);
    try {
      await documentsApi.verify(doc.id);
      onVerified?.(doc.id);
    } catch {
      setError('Unable to verify document. Please try again.');
    } finally {
      setVerifyingId(null);
    }
  };

  if (documents.length === 0) {
    return <p className="text-sm text-gov-muted">No documents uploaded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-gov-error">{error}</p>}
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gov-bg dark:bg-slate-800 rounded-md text-sm"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-gov-blue flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.originalName}</p>
                <p className="text-xs text-gov-muted">
                  {(doc.fileSize / 1024).toFixed(1)} KB
                  {doc.isVerified && (
                    <span className="ml-2 inline-flex items-center gap-1 text-gov-success font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(doc)}
                isLoading={viewingId === doc.id}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              {canVerify && !doc.isVerified && (
                <Button
                  size="sm"
                  onClick={() => handleVerify(doc)}
                  isLoading={verifyingId === doc.id}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verify
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
