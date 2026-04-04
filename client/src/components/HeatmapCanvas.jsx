import { useEffect, useRef, useState } from "react";
import { fetchHeatmap, fetchEvents } from "../api";
import { MousePointer2, AlertTriangle, Camera, Download, Upload, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

export default function HeatmapCanvas({ siteId }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("/");
  const [stats, setStats] = useState({ total: 0, rage: 0 });
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [showUploadLink, setShowUploadLink] = useState(false);
  
  const [pageUrl, setPageUrl] = useState("");
  const [viewMode, setViewMode] = useState("both"); // "both", "heatmap", "screenshot"

  // Fetch available pages
  useEffect(() => {
    fetchEvents(siteId, "page", "pageview")
      .then(res => {
        if (res.length > 0) {
          const uniquePages = [...new Set(res.map(r => r.page))];
          setPages(uniquePages);
          setSelectedPage(uniquePages[0]);
        }
      })
      .catch(console.error);
  }, [siteId]);

  // Load cached screenshot if available
  useEffect(() => {
    if (!siteId || !selectedPage) return;
    setScreenshot(null);
    setShowUploadLink(false);
    api.get(`/api/screenshot/${siteId}/${encodeURIComponent(selectedPage)}`)
      .then(res => {
        if (res.data.image) setScreenshot(res.data.image);
      })
      .catch(() => { /* No cached screenshot */ });
  }, [siteId, selectedPage]);

  const handleCapture = async () => {
    if (!pageUrl) return toast.error("Please enter the full URL to capture");
    setCapturing(true);
    const tId = toast.loading("📸 Capturing page screenshot...");
    try {
      const res = await api.post("/api/screenshot/capture", {
        siteId, page: selectedPage, url: pageUrl
      });
      
      if (res.status === 202) {
        toast.error("Auto-capture unavailable on current hosting.", { id: tId });
        setShowUploadLink(true);
      } else {
        setScreenshot(res.data.image);
        toast.success("Screenshot captured!", { id: tId });
      }
    } catch (err) {
      toast.error("Capture failed. Try manual upload.", { id: tId });
      setShowUploadLink(true);
    } finally {
      setCapturing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("siteId", siteId);
    formData.append("page", selectedPage);

    const tId = toast.loading("Uploading screenshot...");
    try {
      const res = await api.post("/api/screenshot/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setScreenshot(res.data.image);
      toast.success("Screenshot uploaded!", { id: tId });
    } catch (err) {
      toast.error("Upload failed.", { id: tId });
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `heatmap-${selectedPage.replace(/\//g, "-")}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Render heatmap
  useEffect(() => {
    const renderHeatmap = async () => {
      if (!selectedPage || !canvasRef.current) return;
      
      try {
        setLoading(true);
        const { clicks, total } = await fetchHeatmap(siteId, selectedPage);
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const w = 1280; 
        const h = 800;
        
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        // 1. Draw Screenshot Background
        if (screenshot && viewMode !== "heatmap") {
          const img = new Image();
          img.src = `data:image/jpeg;base64,${screenshot}`;
          await new Promise(resolve => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, w, h);
              resolve();
            };
            img.onerror = resolve;
          });
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(0,0,0,0.05)";
          ctx.beginPath();
          for (let i = 0; i < w; i += 100) { ctx.moveTo(i, 0); ctx.lineTo(i, h); }
          for (let j = 0; j < h; j += 100) { ctx.moveTo(0, j); ctx.lineTo(w, j); }
          ctx.stroke();
        }

        if (viewMode === "screenshot") {
          setStats({ total, rage: clicks.filter(c => c.isRageClick).length });
          setLoading(false);
          return;
        }

        // 2. Overlay Heatmap
        ctx.save();
        // Use 'screen' or 'multiply' depending on background
        ctx.globalCompositeOperation = screenshot ? "multiply" : "source-over";
        
        let rageCount = 0;
        clicks.forEach(c => {
          if (c.isRageClick) rageCount++;
          const x = c.x * w;
          const y = c.y * h;
          
          const grad = ctx.createRadialGradient(x, y, 0, x, y, 50);
          grad.addColorStop(0, "rgba(255, 69, 0, 0.7)");    // Fire Red/Orange
          grad.addColorStop(0.3, "rgba(255, 140, 0, 0.4)");  // Dark Orange
          grad.addColorStop(0.6, "rgba(255, 215, 0, 0.1)");  // Gold
          grad.addColorStop(1, "rgba(0, 0, 255, 0)");
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, 50, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // 3. Rage Clicks (Glowy Red X on top)
        clicks.filter(c => c.isRageClick).forEach(c => {
          const x = c.x * w;
          const y = c.y * h;
          
          // Glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#ff0000";
          ctx.strokeStyle = "#ffffff"; // White core
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x-10, y-10); ctx.lineTo(x+10, y+10);
          ctx.moveTo(x+10, y-10); ctx.lineTo(x-10, y+10);
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
        
        setStats({ total, rage: rageCount });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    renderHeatmap();
  }, [siteId, selectedPage, screenshot, viewMode]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      {/* Top Configuration Bar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center mb-6">
        <div className="flex items-center gap-3">
          <select 
            value={selectedPage} 
            onChange={(e) => { setSelectedPage(e.target.value); setPageUrl(""); }}
            className="h-10 px-3 bg-gray-50 border border-gray-200 text-sm font-bold tracking-wider rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            disabled={loading || capturing}
          >
            {pages.length === 0 ? (
              <option value="/">No pages tracked yet...</option>
            ) : (
              pages.map(p => <option key={p} value={p}>{p}</option>)
            )}
          </select>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode("both")} className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === "both" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>Combined</button>
            <button onClick={() => setViewMode("heatmap")} className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === "heatmap" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>Heatmap Only</button>
            <button onClick={() => setViewMode("screenshot")} className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === "screenshot" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>Screenshot Only</button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <input 
            type="text" 
            placeholder="Full URL (e.g. https://yoursite.com/)" 
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500"
          />
          <button 
            onClick={handleCapture}
            disabled={capturing || loading}
            className="h-10 px-4 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            <Camera size={16} /> Capture
          </button>
          <button 
            onClick={() => fileInputRef.current.click()}
            className="h-10 px-3 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center"
            title="Upload Screenshot"
          >
            <Upload size={16} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          <button 
            onClick={handleDownload}
            disabled={loading}
            className="h-10 px-3 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center disabled:opacity-50"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 w-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative shadow-inner min-h-[500px]">
        {!screenshot && !loading && !capturing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-[2px]">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-center max-w-sm">
              <Info className="mx-auto text-emerald-500 mb-4" size={32} />
              <h4 className="font-bold text-gray-900 mb-2">No background screenshot</h4>
              <p className="text-sm text-gray-500 mb-6">To see the heatmap on your real site, enter the URL above and click Capture, or upload a screenshot manually.</p>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition"
              >
                Upload Manually
              </button>
            </div>
          </div>
        )}

        <canvas 
          ref={canvasRef}
          className="w-full h-auto object-contain mx-auto"
        />
        
        {(loading || capturing) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mb-4"></div>
            <p className="text-sm font-semibold text-gray-600">
              {capturing ? "📸 Capturing background screenshot..." : "Rendering heatmap..."}
            </p>
          </div>
        )}
      </div>
      
      {/* Footer Stats */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><MousePointer2 size={14} className="text-emerald-500" /> {stats.total.toLocaleString()} total clicks</span>
          <span className="flex items-center gap-1.5 font-bold"><AlertTriangle size={14} className="text-red-500" /> {stats.rage.toLocaleString()} rage clicks</span>
        </div>
        <div className="flex items-center gap-1 font-medium">
          <span className="text-blue-500">Cold</span>
          <div className="w-24 h-2 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full mx-2" />
          <span className="text-red-500">Hot</span>
        </div>
      </div>
    </div>
  );
}
