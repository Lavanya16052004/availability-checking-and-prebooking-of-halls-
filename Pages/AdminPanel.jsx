
import React, { useState, useEffect } from "react";
import { User, RoomStatus } from "@/entities/all";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle, Building, Shield, Loader2, Home, Users, Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const buildings = ["Main Block", "Dharithri Block"];
const roomTypes = ["Lecture Hall", "Lab", "Common Hall", "Staff Room", "Office", "Cabin"];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRoom, setNewRoom] = useState({
    building: "Main Block",
    block: "",
    floor: 1,
    room_number: "",
    room_type: "Lecture Hall",
    is_clickable: true
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl("Dashboard"));
        } else {
          setCurrentUser(user);
          loadData();
        }
      } catch (e) {
        navigate(createPageUrl("Dashboard"));
      }
    };
    checkAdmin();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    const [allRooms, allUsers] = await Promise.all([
        RoomStatus.list(),
        User.list()
    ]);
    setRooms(allRooms.sort((a, b) => a.room_id.localeCompare(b.room_id)));
    setUsers(allUsers);
    setIsLoading(false);
  };
  
  const handleToggleApproval = async (userId, currentStatus) => {
    try {
        await User.update(userId, { is_approved: !currentStatus });
        loadData();
    } catch (error) {
        console.error("Failed to update user status:", error);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { building, block, floor, room_number, room_type, is_clickable } = newRoom;
    const blockPart = block ? `${block}-` : '';
    const roomId = `${building.replace(/ /g, '')}-${blockPart}F${floor}-${room_number}`;
    
    try {
      await RoomStatus.create({ ...newRoom, room_id: roomId });
      loadData();
      setNewRoom({ building: "Main Block", block: "", floor: 1, room_number: "", room_type: "Lecture Hall", is_clickable: true });
    } catch (error) { console.error("Failed to add room:", error); }
    setIsSubmitting(false);
  };
  
  const handleDeleteRoom = async (roomId) => {
    try {
      await RoomStatus.delete(roomId);
      loadData();
    } catch (error) { console.error("Failed to delete room:", error); }
  };
  
  const organizeRooms = (roomsList) => {
    const organized = {};
    roomsList.forEach(room => {
      if (!organized[room.building]) {
        organized[room.building] = {};
      }
      const blockKey = room.block && room.block.trim() !== '' ? room.block : 'General';
      if (!organized[room.building][blockKey]) {
        organized[room.building][blockKey] = [];
      }
      organized[room.building][blockKey].push(room);
    });
    return organized;
  };

  const organizedRooms = organizeRooms(rooms);

  if (!currentUser) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Panel</h1>
            <p className="text-slate-600">Manage faculty access and college rooms</p>
        </div>
      </div>
      
      <div className="flex border-b">
        <Button variant="ghost" onClick={() => setActiveTab('users')} className={`rounded-none ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-700' : ''}`}>Manage Users</Button>
        <Button variant="ghost" onClick={() => setActiveTab('rooms')} className={`rounded-none ${activeTab === 'rooms' ? 'border-b-2 border-blue-600 text-blue-700' : ''}`}>Manage Rooms</Button>
      </div>

      {activeTab === 'users' && (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Faculty Access Management</CardTitle></CardHeader>
            <CardContent>
                <div className="md:hidden">
                    {isLoading ? <div className="text-center p-4"><Loader2 className="mx-auto my-4 h-6 w-6 animate-spin"/></div> :
                        users.map(user => (
                            <div key={user.id} className="border-b p-4 space-y-2 last:border-b-0">
                                <div className="font-bold text-slate-800">{user.full_name}</div>
                                <div className="text-sm text-slate-500">{user.email}</div>
                                <div className="text-sm text-slate-500">Role: {user.role}</div>
                                <div className="flex items-center justify-between pt-2">
                                    <Label>Access Approved</Label>
                                    {user.role === 'admin' ? <Check className="w-5 h-5 text-green-600"/> : <Switch checked={user.is_approved} onCheckedChange={() => handleToggleApproval(user.id, user.is_approved)}/>}
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="hidden md:block max-h-[600px] overflow-y-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-center">Access Approved</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan="4" className="text-center"><Loader2 className="mx-auto my-4 h-6 w-6 animate-spin"/></TableCell></TableRow> :
                                users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.full_name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell className="text-center">
                                            {user.role === 'admin' ? <Check className="w-5 h-5 text-green-600 mx-auto"/> : <Switch checked={user.is_approved} onCheckedChange={() => handleToggleApproval(user.id, user.is_approved)}/>}
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      )}

      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="w-5 h-5"/> Add New Room</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAddRoom} className="space-y-4">
                    <div className="space-y-1"><Label>Building</Label><Select value={newRoom.building} onValueChange={(val) => setNewRoom(p => ({...p, building: val, block: ''}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{buildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1"><Label>Block (Optional)</Label><Input value={newRoom.block} onChange={(e) => setNewRoom(p => ({...p, block: e.target.value.toUpperCase()}))} placeholder="e.g., A, B" /></div>
                    <div className="space-y-1"><Label>Floor</Label><Input type="number" value={newRoom.floor} onChange={(e) => setNewRoom(p => ({...p, floor: parseInt(e.target.value)}))} placeholder="0 for Ground" required/></div>
                    <div className="space-y-1"><Label>Room Number</Label><Input value={newRoom.room_number} onChange={(e) => setNewRoom(p => ({...p, room_number: e.target.value}))} placeholder="e.g., 101" required/></div>
                    <div className="space-y-1"><Label>Room Type</Label><Select value={newRoom.room_type} onValueChange={(val) => setNewRoom(p => ({...p, room_type: val}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{roomTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex items-center gap-2 pt-2"><Switch id="is_clickable" checked={newRoom.is_clickable} onCheckedChange={(val) => setNewRoom(p => ({...p, is_clickable: val}))} /><Label htmlFor="is_clickable">Faculty can occupy this room</Label></div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Room</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Home className="w-5 h-5"/> Manage Existing Rooms</CardTitle><CardDescription>Total Rooms: {rooms.length}</CardDescription></CardHeader>
                <CardContent>
                  <div className="max-h-[600px] overflow-y-auto space-y-6">
                    {isLoading ? <div className="text-center"><Loader2 className="mx-auto my-4 h-6 w-6 animate-spin"/></div> :
                      Object.entries(organizedRooms).map(([building, blocks]) => (
                        <div key={building}>
                          <h3 className="text-xl font-semibold text-slate-700 mb-3 border-b pb-2">{building}</h3>
                          <div className="space-y-4">
                            {Object.entries(blocks).map(([block, blockRooms]) => (
                              <div key={block}>
                                <h4 className="font-semibold text-slate-600 mb-2">Block: {block}</h4>
                                
                                {/* Mobile view for rooms */}
                                <div className="md:hidden space-y-2">
                                  {blockRooms.map(room => (
                                    <div key={room.id} className="border p-3 rounded-lg shadow-sm">
                                      <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-slate-800">{room.room_id}</div>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="w-4 h-4"/></Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete room <span className="font-bold">{room.room_id}</span>.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRoom(room.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                      <div className="text-sm text-slate-600">Type: {room.room_type}</div>
                                      <div className="flex items-center gap-2 text-sm text-slate-600">
                                        Occupiable: {room.is_clickable ? <Check className="w-4 h-4 text-green-600"/> : <X className="w-4 h-4 text-red-600"/>}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Desktop view for rooms */}
                                <div className="hidden md:block border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-slate-50">
                                      <TableHead>Room ID</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Occupiable</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {blockRooms.map(room => (
                                      <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.room_id}</TableCell>
                                        <TableCell>{room.room_type}</TableCell>
                                        <TableCell>{room.is_clickable ? "Yes" : "No"}</TableCell>
                                        <TableCell className="text-right">
                                           <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="w-4 h-4"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete room <span className="font-bold">{room.room_id}</span>.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRoom(room.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      )}
    </div>
  );
}
