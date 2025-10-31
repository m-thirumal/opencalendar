"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EventModal({ open, onClose, onSave, defaultValues }) {
  const [event, setEvent] = useState(
    defaultValues || {
      summary: "",
      description: "",
      location: "",
      start: "",
      end: "",
      organizer: "",
      attendees: "",
      status: "CONFIRMED",
      categories: "",
      priority: "5",
      url: "",
    }
  );

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add / Edit Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Title</Label>
          <Input name="summary" value={event.summary} onChange={handleChange} />

          <Label>Description</Label>
          <Textarea name="description" value={event.description} onChange={handleChange} />

          <Label>Location</Label>
          <Input name="location" value={event.location} onChange={handleChange} />

          <Label>Start</Label>
          <Input type="datetime-local" name="start" value={event.start} onChange={handleChange} />

          <Label>End</Label>
          <Input type="datetime-local" name="end" value={event.end} onChange={handleChange} />

          <Label>Organizer (email)</Label>
          <Input name="organizer" value={event.organizer} onChange={handleChange} />

          <Label>Attendees (comma-separated emails)</Label>
          <Input name="attendees" value={event.attendees} onChange={handleChange} />

          <Label>Status</Label>
          <select
            name="status"
            value={event.status}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="CONFIRMED">Confirmed</option>
            <option value="TENTATIVE">Tentative</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(event)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
