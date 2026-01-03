import { useState } from "react";
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { Button, Card } from "../common";
import styles from "./Documents.module.css";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadedDate: string;
  uploadedBy?: string;
  url?: string;
}

interface DocumentsProps {
  employeeId?: string;
  isAdmin?: boolean;
  readOnly?: boolean;
}

const DOCUMENT_CATEGORIES = [
  "Identity Proof",
  "Address Proof",
  "Educational Certificates",
  "Experience Letters",
  "Offer Letter",
  "Appointment Letter",
  "Bank Documents",
  "Other",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const Documents = ({ employeeId, isAdmin = false, readOnly = false }: DocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Aadhar_Card.pdf",
      type: "application/pdf",
      size: 245678,
      category: "Identity Proof",
      uploadedDate: "2024-01-15",
      uploadedBy: "Self",
    },
    {
      id: "2",
      name: "10th_Marksheet.pdf",
      type: "application/pdf",
      size: 512345,
      category: "Educational Certificates",
      uploadedDate: "2024-01-15",
      uploadedBy: "Self",
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText size={20} color="#dc2626" />;
    if (type.includes("image")) return <ImageIcon size={20} color="#059669" />;
    return <File size={20} color="#6b7280" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");
    setUploadSuccess(false);

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError("Invalid file type. Only PDF, Images, and Word documents are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadCategory) {
      setUploadError("Please select a file and category.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // formData.append('category', uploadCategory);
      // formData.append('employeeId', employeeId || '');
      // await uploadDocument(formData);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newDocument: Document = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        category: uploadCategory,
        uploadedDate: new Date().toISOString().split("T")[0],
        uploadedBy: isAdmin ? "Admin" : "Self",
      };

      setDocuments([...documents, newDocument]);
      setUploadSuccess(true);

      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadCategory("");
        setUploadSuccess(false);
      }, 1500);
    } catch (error) {
      setUploadError("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // TODO: Replace with actual API call
      // await deleteDocument(documentId);

      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleDownload = (document: Document) => {
    // TODO: Replace with actual download implementation
    console.log("Downloading:", document.name);
    alert(`Download functionality will be implemented when backend is ready.\nFile: ${document.name}`);
  };

  const filteredDocuments =
    selectedCategory === "All"
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  const documentsByCategory = DOCUMENT_CATEGORIES.reduce((acc, category) => {
    acc[category] = documents.filter((doc) => doc.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={styles.documentsContainer}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Documents</h2>
          <p className={styles.subtitle}>
            {isAdmin
              ? "Manage employee documents and certificates"
              : "Upload and manage your documents"}
          </p>
        </div>
        {!readOnly && (
          <Button
            icon={<Upload size={18} />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Document
          </Button>
        )}
      </div>

      <div className={styles.content}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Categories</h3>
          <div className={styles.categoryList}>
            <button
              className={`${styles.categoryItem} ${
                selectedCategory === "All" ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory("All")}
            >
              <span>All Documents</span>
              <span className={styles.badge}>{documents.length}</span>
            </button>
            {DOCUMENT_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`${styles.categoryItem} ${
                  selectedCategory === category ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <span>{category}</span>
                <span className={styles.badge}>
                  {documentsByCategory[category] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className={styles.documentsGrid}>
          {filteredDocuments.length === 0 ? (
            <div className={styles.emptyState}>
              <Paperclip size={48} color="#9ca3af" />
              <h3>No documents found</h3>
              <p>
                {selectedCategory === "All"
                  ? "Upload your first document to get started"
                  : `No documents in ${selectedCategory} category`}
              </p>
              {!readOnly && (
                <Button
                  icon={<Upload size={18} />}
                  onClick={() => setShowUploadModal(true)}
                  style={{ marginTop: "1rem" }}
                >
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className={styles.documentCard}>
                <div className={styles.documentIcon}>{getFileIcon(doc.type)}</div>
                <div className={styles.documentInfo}>
                  <h4 className={styles.documentName}>{doc.name}</h4>
                  <p className={styles.documentMeta}>
                    {doc.category} • {formatFileSize(doc.size)}
                  </p>
                  <p className={styles.documentDate}>
                    Uploaded on {new Date(doc.uploadedDate).toLocaleDateString()}
                    {doc.uploadedBy && ` by ${doc.uploadedBy}`}
                  </p>
                </div>
                <div className={styles.documentActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => setPreviewDocument(doc)}
                    title="Preview"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDownload(doc)}
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  {!readOnly && (
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(doc.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Upload Document</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadCategory("");
                  setUploadError("");
                  setUploadSuccess(false);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {uploadSuccess ? (
                <div className={styles.successMessage}>
                  <CheckCircle size={48} color="#059669" />
                  <h4>Document uploaded successfully!</h4>
                </div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Category *</label>
                    <select
                      className={styles.select}
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {DOCUMENT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>File *</label>
                    <div className={styles.fileUploadArea}>
                      <input
                        type="file"
                        id="documentFile"
                        className={styles.fileInput}
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <label htmlFor="documentFile" className={styles.fileLabel}>
                        <Upload size={32} color="#7c3aed" />
                        <p>
                          <strong>Click to upload</strong> or drag and drop
                        </p>
                        <p className={styles.fileHint}>
                          PDF, Image, or Word document (max 5MB)
                        </p>
                      </label>
                    </div>
                    {selectedFile && (
                      <div className={styles.selectedFile}>
                        {getFileIcon(selectedFile.type)}
                        <span>{selectedFile.name}</span>
                        <span className={styles.fileSize}>
                          {formatFileSize(selectedFile.size)}
                        </span>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className={styles.errorMessage}>
                      <AlertCircle size={18} />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {!uploadSuccess && (
              <div className={styles.modalFooter}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadCategory("");
                    setUploadError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  isLoading={uploading}
                  disabled={!selectedFile || !uploadCategory}
                >
                  Upload
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.previewModal}`}>
            <div className={styles.modalHeader}>
              <h3>{previewDocument.name}</h3>
              <button
                className={styles.closeButton}
                onClick={() => setPreviewDocument(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.previewPlaceholder}>
                {getFileIcon(previewDocument.type)}
                <p>Document Preview</p>
                <p className={styles.previewHint}>
                  Preview functionality will be implemented when backend is ready
                </p>
                <div className={styles.previewInfo}>
                  <p><strong>Category:</strong> {previewDocument.category}</p>
                  <p><strong>Size:</strong> {formatFileSize(previewDocument.size)}</p>
                  <p><strong>Uploaded:</strong> {new Date(previewDocument.uploadedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => setPreviewDocument(null)}
              >
                Close
              </Button>
              <Button
                icon={<Download size={18} />}
                onClick={() => handleDownload(previewDocument)}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
