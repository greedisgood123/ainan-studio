"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SettingsSection({
	onSetHero,
	isLoading = false,
}: {
	onSetHero: (payload: { mp4?: File; webm?: File; poster?: File }) => Promise<void>
	isLoading?: boolean
}) {
	const [mp4, setMp4] = useState<File | undefined>(undefined)
	const [webm, setWebm] = useState<File | undefined>(undefined)
	const [poster, setPoster] = useState<File | undefined>(undefined)
	const [submitting, setSubmitting] = useState(false)

	return (
		<div className="space-y-5">
			<Card>
				<CardHeader>
					<CardTitle className="text-base sm:text-lg">Hero Media</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="hero-mp4">MP4 (optional)</Label>
							<Input id="hero-mp4" type="file" accept="video/mp4" onChange={(e) => setMp4(e.target.files?.[0])} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="hero-webm">WEBM (optional)</Label>
							<Input id="hero-webm" type="file" accept="video/webm" onChange={(e) => setWebm(e.target.files?.[0])} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="hero-poster">Poster image (optional)</Label>
							<Input id="hero-poster" type="file" accept="image/*" onChange={(e) => setPoster(e.target.files?.[0])} />
						</div>
					</div>
					<Button
						disabled={isLoading || submitting || (!mp4 && !webm && !poster)}
						onClick={async () => {
							setSubmitting(true)
							try {
								await onSetHero({ mp4, webm, poster })
								// simple feedback
								try { alert("Saved hero media.") } catch {}
							} finally {
								setSubmitting(false)
							}
						}}
					>
						Save Hero Media
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}


