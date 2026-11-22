using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Windows.Forms;

internal static class Program
{
    private const int ServerPort = 3001;
    private const string ServerUrl = "http://localhost:3001/";
    private const string AppTitle = "Maison Benali";

    [STAThread]
    private static void Main()
    {
        string appDir = AppDomain.CurrentDomain.BaseDirectory;
        if (appDir.Length > 0 && appDir.EndsWith(Path.DirectorySeparatorChar.ToString()))
        {
            appDir = appDir.Substring(0, appDir.Length - 1);
        }

        try
        {
            // Le serveur tourne déjà : on ouvre simplement le site.
            if (IsServerUp())
            {
                OpenBrowser();
                return;
            }

            if (!File.Exists(Path.Combine(appDir, "server.js")))
            {
                ShowError("Le fichier server.js est introuvable à côté de ce raccourci.\n\n"
                    + "Placez " + Path.GetFileName(Application.ExecutablePath)
                    + " dans le dossier du site Maison Benali.");
                return;
            }

            string nodePath = FindNode();
            if (nodePath == null)
            {
                ShowError("Node.js est introuvable sur cet ordinateur.\n\n"
                    + "Installez Node.js depuis https://nodejs.org, puis relancez ce raccourci.");
                return;
            }

            StartServer(appDir, nodePath);

            if (WaitForServer(25000))
            {
                OpenBrowser();
            }
            else
            {
                ShowError("Le serveur n'a pas démarré dans le délai prévu.\n\n"
                    + "Ouvrez un terminal dans le dossier du site et lancez \"node server.js\" "
                    + "pour voir le message d'erreur.");
            }
        }
        catch (Exception ex)
        {
            ShowError("Impossible de démarrer le serveur :\n" + ex.Message);
        }
    }

    private static void StartServer(string appDir, string nodePath)
    {
        // Lance Node directement, sans fenêtre : le serveur reste actif après la fermeture du raccourci.
        ProcessStartInfo info = new ProcessStartInfo();
        info.FileName = nodePath;
        info.Arguments = "server.js";
        info.WorkingDirectory = appDir;
        info.UseShellExecute = false;
        info.CreateNoWindow = true;
        info.WindowStyle = ProcessWindowStyle.Hidden;
        info.EnvironmentVariables["PORT"] = ServerPort.ToString();
        Process.Start(info);
    }

    private static bool WaitForServer(int timeoutMs)
    {
        int waited = 0;
        while (waited < timeoutMs)
        {
            if (IsServerUp())
            {
                return true;
            }
            System.Threading.Thread.Sleep(250);
            waited += 250;
        }
        return false;
    }

    private static bool IsServerUp()
    {
        try
        {
            using (TcpClient client = new TcpClient())
            {
                IAsyncResult result = client.BeginConnect(IPAddress.Loopback, ServerPort, null, null);
                if (!result.AsyncWaitHandle.WaitOne(400))
                {
                    return false;
                }
                client.EndConnect(result);
                return true;
            }
        }
        catch (Exception)
        {
            return false;
        }
    }

    private static string FindNode()
    {
        string pathVariable = Environment.GetEnvironmentVariable("PATH");
        if (!string.IsNullOrEmpty(pathVariable))
        {
            string[] folders = pathVariable.Split(';');
            foreach (string folder in folders)
            {
                string candidate = TryCombine(folder, "node.exe");
                if (candidate != null)
                {
                    return candidate;
                }
            }
        }

        string[] known =
        {
            TryCombine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs\\node.exe"),
            TryCombine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "nodejs\\node.exe"),
            TryCombine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs\\nodejs\\node.exe"),
            "C:\\Program Files\\nodejs\\node.exe"
        };

        foreach (string candidate in known)
        {
            if (candidate != null && File.Exists(candidate))
            {
                return candidate;
            }
        }

        return null;
    }

    private static string TryCombine(string folder, string relativePath)
    {
        try
        {
            if (string.IsNullOrEmpty(folder))
            {
                return null;
            }
            string trimmed = folder.Trim().Trim('"');
            if (trimmed.Length == 0)
            {
                return null;
            }
            string full = Path.Combine(trimmed, relativePath);
            return File.Exists(full) ? full : null;
        }
        catch (Exception)
        {
            return null;
        }
    }

    private static void OpenBrowser()
    {
        Process.Start(ServerUrl);
    }

    private static void ShowError(string message)
    {
        MessageBox.Show(message, AppTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
    }
}
