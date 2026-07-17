export async function shareCard(
  logId: string,
  text: string,
  filename = "mulaibaca-card.png"
) {
  try {
    const res = await fetch(`/api/og/log/${logId}`);
    if (!res.ok) throw new Error("Gagal memuat kartu");
    const blob = await res.blob();

    if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "image/png" })] })) {
      const file = new File([blob], filename, { type: "image/png" });
      await navigator.share({ title: "mulaibaca", text, files: [file] });
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Share card failed:", err);
    if (navigator.share) {
      try {
        await navigator.share({ title: "mulaibaca", text });
      } catch {}
    }
  }
}
