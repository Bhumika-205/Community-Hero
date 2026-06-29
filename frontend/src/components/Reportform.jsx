// src/components/ReportForm.jsx
import React, { useRef } from 'react';
import { AlertCircle, Brain, Zap, Search, Loader2, MapPin, CheckCircle2, Upload, X } from 'lucide-react';

export default function ReportForm({
    title, setTitle,
    description, setDescription,
    locQuery, onLocInput, locResults, onPickLocation, locSearching,
    onUseMyLocation, lat, address,
    imagePreview, imgUploading, onImageFile, onClearImage,
    submitting, onSubmit,
}) {
    const fileRef = useRef(null);

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shrink-0">
            {/* AI explanation banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-start gap-2.5 mb-4">
                <Brain className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-700 leading-relaxed">
                    <strong>Gemini AI</strong> reads your description and automatically assigns a{' '}
                    <strong>category</strong> and <strong>severity</strong>. You never need to pick these.
                </p>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-indigo-600" /> Report a Community Issue
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Title</label>
                    <input
                        type="text" value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="e.g., Broken streetlamp near bus stop"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Description{' '}
                        <span className="inline-flex items-center gap-1 text-indigo-500 font-semibold normal-case ml-1">
                            <Zap className="h-3 w-3" /> AI classifies from this
                        </span>
                    </label>
                    <textarea
                        rows={3} value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the issue — what it is, how long, who it affects. Gemini reads this to auto-assign category & severity."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition resize-none"
                    />
                </div>

                {/* Location search */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        {locSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin pointer-events-none" />}
                        <input
                            type="text" value={locQuery} onChange={e => onLocInput(e.target.value)}
                            placeholder="Search city, area or landmark…"
                            className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition"
                        />
                    </div>

                    {locResults.length > 0 && (
                        <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 relative">
                            {locResults.map((r, i) => (
                                <button key={i} type="button" onClick={() => onPickLocation(r)}
                                    className="w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-b border-slate-100 last:border-0 transition flex items-start gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        <button type="button" onClick={onUseMyLocation}
                            className="flex-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition">
                            <MapPin className="h-3.5 w-3.5" /> Use My Location
                        </button>
                        <span className="text-[10px] text-slate-400 shrink-0">or tap the map →</span>
                    </div>

                    {lat && (
                        <div className="mt-2 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[10px] font-bold text-emerald-700">Location pinned —</span>
                            <span className="text-[10px] text-emerald-600 truncate">
                                {(address || '').split(',').slice(0, 2).join(',')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Photo upload */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Photo (optional)</label>
                    {imagePreview ? (
                        <div className="relative rounded-lg overflow-hidden">
                            <img src={imagePreview} alt="preview" className="w-full h-36 object-cover" />
                            {imgUploading ? (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading to Cloudinary…
                                    </span>
                                </div>
                            ) : (
                                <button type="button" onClick={onClearImage}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-slate-200 hover:bg-red-50 transition">
                                    <X className="h-3.5 w-3.5 text-red-500" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); onImageFile(e.dataTransfer.files[0]); }}
                            className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-5 text-center cursor-pointer transition group"
                        >
                            <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 mx-auto mb-1 transition" />
                            <p className="text-xs text-slate-500">Click or drag &amp; drop a photo</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG · max 10 MB</p>
                        </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => onImageFile(e.target.files[0])} />
                </div>

                <button type="submit" disabled={submitting || imgUploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50">
                    {submitting
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Gemini AI is analysing…</>
                        : <><Brain className="h-4 w-4" /> Submit &amp; Auto-Classify (+15 XP)</>}
                </button>
            </form>
        </div>
    );
}