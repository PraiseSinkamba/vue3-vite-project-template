<script setup lang="ts"></script>

<template>
  <section class="py-16 bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Services</h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our wide range of services tailored to what ever style you are going for
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>

      <div class="text-center mt-12">
        <Button variant="outline" size="lg" asChild>
          <Link href="/services">View All Services</Link>
        </Button>
      </div>
    </div>
  </section>
</template>
