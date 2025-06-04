<script setup lang="ts">
import {
  MoreHorizontal,
  Plus,
  Bookmark,
  EyeOff,
  UserMinus,
  Users,
  Settings,
  AlertTriangle,
  Copy,
  Home,
  Briefcase,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  Trash2,
  Edit,
  Share,
  Heart,
  MessageCircle,
  Repeat,
} from 'lucide-vue-next'

import { ResponsiveMenu, type MenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// Example 1: Social Media Post Menu
const socialMenuItems: MenuItem[] = [
  {
    id: 'add-to-feed',
    label: 'Add to feed',
    icon: Plus,
    children: [
      { id: 'home', label: 'Home', icon: Home, onClick: () => console.log('Added to Home') },
      { id: 'work', label: 'Work', icon: Briefcase, onClick: () => console.log('Added to Work') },
      {
        id: 'personal',
        label: 'Personal',
        icon: User,
        onClick: () => console.log('Added to Personal'),
      },
    ],
  },
  { id: 'save', label: 'Save', icon: Bookmark, onClick: () => console.log('Saved') },
  {
    id: 'not-interested',
    label: 'Not interested',
    icon: EyeOff,
    onClick: () => console.log('Not interested'),
  },
  { id: 'separator-1', label: '', separator: true },
  { id: 'mute', label: 'Mute', icon: UserMinus, onClick: () => console.log('Muted') },
  { id: 'unfollow', label: 'Unfollow', icon: Users, onClick: () => console.log('Unfollowed') },
  {
    id: 'advanced',
    label: 'Advanced options',
    icon: Settings,
    children: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        onClick: () => console.log('Notifications'),
      },
      { id: 'privacy', label: 'Privacy', icon: Shield, onClick: () => console.log('Privacy') },
      {
        id: 'appearance',
        label: 'Appearance',
        icon: Palette,
        onClick: () => console.log('Appearance'),
      },
    ],
  },
  { id: 'separator-2', label: '', separator: true },
  {
    id: 'report',
    label: 'Report',
    icon: AlertTriangle,
    variant: 'destructive',
    onClick: () => console.log('Reported'),
  },
  { id: 'copy-link', label: 'Copy link', icon: Copy, onClick: () => console.log('Link copied') },
]

// Example 2: File Manager Menu
const fileMenuItems: MenuItem[] = [
  {
    id: 'new',
    label: 'New',
    icon: Plus,
    children: [
      { id: 'folder', label: 'Folder', icon: Archive, onClick: () => console.log('New folder') },
      {
        id: 'document',
        label: 'Document',
        icon: FileText,
        onClick: () => console.log('New document'),
      },
      { id: 'separator-new', label: '', separator: true },
      {
        id: 'media',
        label: 'Media',
        icon: ImageIcon,
        children: [
          { id: 'image', label: 'Image', icon: ImageIcon, onClick: () => console.log('New image') },
          { id: 'video', label: 'Video', icon: Video, onClick: () => console.log('New video') },
          { id: 'audio', label: 'Audio', icon: Music, onClick: () => console.log('New audio') },
        ],
      },
    ],
  },
  { id: 'separator-1', label: '', separator: true },
  { id: 'upload', label: 'Upload', icon: Upload, onClick: () => console.log('Upload') },
  { id: 'download', label: 'Download', icon: Download, onClick: () => console.log('Download') },
  { id: 'separator-2', label: '', separator: true },
  { id: 'edit', label: 'Edit', icon: Edit, onClick: () => console.log('Edit') },
  { id: 'share', label: 'Share', icon: Share, onClick: () => console.log('Share') },
  { id: 'separator-3', label: '', separator: true },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    onClick: () => console.log('Delete'),
  },
]

// Example 3: Social Actions Menu
const socialActionsItems: MenuItem[] = [
  { id: 'like', label: 'Like', icon: Heart, onClick: () => console.log('Liked') },
  { id: 'comment', label: 'Comment', icon: MessageCircle, onClick: () => console.log('Comment') },
  { id: 'repost', label: 'Repost', icon: Repeat, onClick: () => console.log('Reposted') },
  { id: 'separator-1', label: '', separator: true },
  {
    id: 'share',
    label: 'Share',
    icon: Share,
    children: [
      {
        id: 'copy-link',
        label: 'Copy link',
        icon: Copy,
        onClick: () => console.log('Link copied'),
      },
      {
        id: 'share-via',
        label: 'Share via...',
        icon: Globe,
        onClick: () => console.log('Share via'),
      },
    ],
  },
  { id: 'separator-2', label: '', separator: true },
  {
    id: 'report',
    label: 'Report',
    icon: AlertTriangle,
    variant: 'destructive',
    onClick: () => console.log('Reported'),
  },
]
</script>

<template>
  <div class="space-y-8">
    <!--    {/* Example 1: Social Media Post Menu */}-->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-white">Social Media Post Menu</h3>
      <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm"
          >
            J
          </div>
          <div>
            <p class="font-medium text-white">Jay</p>
            <p class="text-gray-400 text-sm">just now</p>
          </div>
        </div>
        <ResponsiveMenu :items="socialMenuItems" title="Post Options">
          <Button size="icon" class="text-white hover:bg-gray-700">
            <MoreHorizontal class="h-5 w-5" />
          </Button>
        </ResponsiveMenu>
      </div>
    </div>

    <!--    {/* Example 2: File Manager Menu */}-->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-white">File Manager Menu</h3>
      <div class="p-4 bg-gray-800 rounded-lg">
        <ResponsiveMenu :items="fileMenuItems" title="File Actions" align="start">
          <Button
            variant="outline"
            class="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <Plus class="h-4 w-4 mr-2" />
            File Actions
          </Button>
        </ResponsiveMenu>
      </div>
    </div>

    <!--    {/* Example 3: Social Actions Menu */}-->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-white">Social Actions Menu</h3>
      <div class="p-4 bg-gray-800 rounded-lg">
        <ResponsiveMenu :items="socialActionsItems" title="Post Actions" align="center">
          <Button variant="secondary" class="bg-gray-700 text-white hover:bg-gray-600">
            Actions
          </Button>
        </ResponsiveMenu>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
