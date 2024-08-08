// types/router.d.ts
import * as Router from "expo-router";

export * from "expo-router";

declare module "expo-router" {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string>
      extends Record<string, unknown> {
      StaticRoutes:
        | ""
        | "/"
        | "/(tabs)"
        | "/(tabs)/rutina"
        | "/(tabs)/rutina/asignar-entreno"
        | "/(tabs)/rutina/configurar-entreno"
        | "/(tabs)/rutina/historico"
        | "/(tabs)/rutina/sesion-de-entrenamiento"
        | "/(tabs)/rutina/management"
        | "/_sitemap"
        | "/anadir-dia"
        | "/asignar-entreno"
        | "/configurar-entreno"
        | "/dias-entreno"
        | "/dias-entreno/anadir-dia"
        | "/ejercicios"
        | "/ejercicios/anadir-ejercicio"
        | "/historico"
        | "/management"
        | "/rutina"
        | "/sesion-de-entrenamiento";
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
