//app/(tabs)/index.tsx
/*
 * This file is necessary to handle the initial redirection of the application.
 *
 * The `InitalRouting` function checks if the root navigation state is loaded.
 * If the navigation state is available, it redirects the user to the "Rutinas" screen.
 *
 * This ensures that users are automatically taken to the main screen
 * of the application upon starting it.
 *
 * It should be created alongside its <Tabs.Screen name="index" redirect /> in app/(tabs)/_layout.tsx
 */

import { useRootNavigationState, Redirect } from "expo-router";

export default function InitalRouting() {
  const rootNavigationState = useRootNavigationState();

  if (!rootNavigationState?.key) return null;

  return <Redirect href={"/(tabs)/rutina"} />;
}
